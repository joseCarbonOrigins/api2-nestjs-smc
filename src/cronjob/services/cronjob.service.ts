import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// AWS
import { LambdaService } from '../../external/services/lambda.service';
// dtos
import { Cronjob } from '../dtos/cronjob.dto';
// schemas
import { Skippy } from '../../database/schemas/skippy.schema';
import { Skip } from '../../database/schemas/skip.schema';
import { Mission } from '../../database/schemas/mission.schema';
// functions
import { FunctionsService } from '../../external/services/functions.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { duration } from 'moment';
@Injectable()
export class CronjobService {
  constructor(
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
    @InjectModel(Skip.name) private skipModel: Model<Skip>,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    private lambdaService: LambdaService,
    private functionService: FunctionsService,
    private configService: ConfigService,
  ) {}

  async getDistanceAndDuration(
    origin: string,
    destination: string,
  ): Promise<any> {
    try {
      const key = this.configService.get('GOOGLE_MAPS_KEY');
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${key}`;
      const response = await axios.get(url);
      const distance = response.data.routes[0].legs[0].distance.value;
      const duration = response.data.routes[0].legs[0].duration.value;
      return { distance: distance, duration: duration * 1000 };
    } catch (e) {
      return { distance: 0, duration: 0 };
    }
  }

  async pushSkippysOrders(payload: Cronjob): Promise<any> {
    try {
      const today = new Date();
      for await (const order of payload.orders) {
        if (order.data) {
          // ask mongodb if skippy has a current skip
          const isSkippyNotBusy = await this.skippyModel.findOne({
            email: order.skippyEmail,
            current_skip_id: null,
          });
          // if skippy is not busy
          if (isSkippyNotBusy) {
            // slice order into missions
            await this.sliceMissions(order, today, isSkippyNotBusy);
          }
        }
      }

      const missions = await this.missionModel
        .find({
          mission_completed: false,
          previous_mission_completed: true,
          skipster_id: null,
        })
        .select(
          'mission_name mission_xp mission_coins estimated_time start_point ending_point start_address_name ending_address_name mock mission_completed',
        )
        .populate({
          path: 'skip_id',
          select: 'skippy_id',
          populate: {
            path: 'skippy_id',
            select: 'name email',
          },
        });

      const lambdaPayload = {
        case: 'new_mission',
        data: missions.length === 0 ? false : true,
        missions: missions,
      };

      // excecute lambda function
      this.lambdaService.invokeLambda(lambdaPayload);

      return payload;
    } catch (error) {
      console.log('error on cron-job endpoint: ', error);
      throw new InternalServerErrorException('Error pushing skippys orders');
    }
  }

  async sliceMissions(
    order: any,
    today: Date,
    isSkippyNotBusy: any,
  ): Promise<any> {
    const oderInfo = {
      order_id: order.orderInfo.id,
      status: order.orderInfo.status,
      customer: order.customer,
      restaurant: order.restaurant,
    };
    // create unlock code for this mission
    const pincode = this.functionService.generateRandomUnlockCode();
    // create new skip for skippy
    const newSkip = new this.skipModel({
      startTime: today,
      endTime: null,
      skippy_id: isSkippyNotBusy._id,
      order_info: oderInfo,
      mock: false,
      unlock_code: pincode,
      estimated_time: 0,
    });
    await newSkip.save();

    let firstcoordinate =
      `${isSkippyNotBusy.location.coordinates[0]}`.toString() +
      ',' +
      `${isSkippyNotBusy.location.coordinates[1]}`.toString();
    let secondcoordinate =
      `${order.restaurant.lat}`.toString() +
      ',' +
      `${order.restaurant.long}`.toString();
    let distanceAndDuration = await this.getDistanceAndDuration(
      firstcoordinate,
      secondcoordinate,
    );
    const ismock = order.mock ? order.mock : false;
    const newMission1 = new this.missionModel({
      mission_name: 'Driving to merchant',
      // DUMMY START POINT
      // ADD: experience, coins
      start_point: isSkippyNotBusy.location,
      ending_point: {
        type: 'Point',
        coordinates: [order.restaurant.lat, order.restaurant.long],
      },
      start_address_name: 'NOT PROVIDED YET',
      ending_address_name: order.restaurant.address,
      skip_id: newSkip._id,
      // dummy values
      mission_xp: 15,
      mission_coins: this.calculateCoins(distanceAndDuration['distance']),
      estimated_time: distanceAndDuration['duration'],
      mission_completed: false,
      previous_mission_completed: true,
      previous_mission_id: null,
      mock: ismock,

      startTime: null,
      endTime: null,
      skipster_id: null,

      distance: distanceAndDuration['distance'],
    });
    firstcoordinate =
      `${order.restaurant.lat}`.toString() +
      ',' +
      `${order.restaurant.long}`.toString();
    secondcoordinate =
      `${order.customer.lat}`.toString() +
      ',' +
      `${order.customer.long}`.toString();
    distanceAndDuration = await this.getDistanceAndDuration(
      firstcoordinate,
      secondcoordinate,
    );
    const newMission2 = new this.missionModel({
      mission_name: 'Driving to customer',
      start_point: {
        type: 'Point',
        coordinates: [order.restaurant.lat, order.restaurant.long],
      },
      ending_point: {
        type: 'Point',
        coordinates: [order.customer.long, order.customer.long],
      },
      start_address_name: order.restaurant.address,
      ending_address_name: order.customer.address,
      skip_id: newSkip._id,

      // dummy values
      mission_xp: 15,
      mission_coins: this.calculateCoins(distanceAndDuration['distance']),
      estimated_time: distanceAndDuration['duration'],

      mission_completed: false,
      previous_mission_completed: false,
      previous_mission_id: newMission1._id,
      mock: ismock,

      startTime: null,
      endTime: null,
      skipster_id: null,

      distance: distanceAndDuration['distance'],
    });

    firstcoordinate =
      `${order.customer.lat}`.toString() +
      ',' +
      `${order.customer.long}`.toString();
    secondcoordinate = `45.000674262505754, -93.26999691463327`;
    distanceAndDuration = await this.getDistanceAndDuration(
      firstcoordinate,
      secondcoordinate,
    );
    const newMission3 = new this.missionModel({
      mission_name: 'Driving Home',
      start_point: {
        type: 'Point',
        coordinates: [order.customer.long, order.customer.long],
      },
      ending_point: {
        type: 'Point',
        coordinates: [45.000674262505754, -93.26999691463327],
      },
      start_address_name: order.customer.address,
      ending_address_name: '1317 County Rd 23, Minneapolis, MN 55413, USA',
      skip_id: newSkip._id,

      // dummy values
      mission_xp: 15,
      mission_coins: this.calculateCoins(distanceAndDuration['distance']),
      estimated_time: distanceAndDuration['duration'],

      mission_completed: false,
      previous_mission_completed: false,
      previous_mission_id: newMission2._id,
      mock: ismock,

      startTime: null,
      endTime: null,
      skipster_id: null,

      distance: distanceAndDuration['distance'],
    });

    await this.skippyModel.findByIdAndUpdate(isSkippyNotBusy._id, {
      current_skip_id: newSkip._id,
      $push: {
        skips: newSkip._id,
        missions: {
          $each: [newMission1._id, newMission2._id, newMission3._id],
        },
      },
    });

    await newMission1.save();
    await newMission2.save();
    await newMission3.save();

    await this.skipModel.findByIdAndUpdate(newSkip._id, {
      $push: {
        missions: {
          $each: [newMission1._id, newMission2._id, newMission3._id],
        },
      },
      estimated_time:
        newMission1.estimated_time +
        newMission2.estimated_time +
        newMission3.estimated_time,
    });
  }

  calculateCoins(distance: number) {
    try {
      return (distance / 4 / 7.25).toFixed(2);
    } catch (error) {
      return 15;
    }
  }
}

// [
//   {
//     "skippyEmail": "sol@carbonorigins.com",
//     "data": true,
//     "customer":{
//         "firstName": "cus firstName",
//       "lastName": "cus lastName",
//       "lat": 45.004898,
//       "long": -93.270065,
//       "address": "2003 Grand St NE, Minneapolis",
//       "zip": "55418"
//     },
//     "restaurant": {
//       "name": "dummy restaurant",
//       "lat": 45.003050,
//       "long": -93.271197,
//       "address": "1509 Marshall St NE, Minneapolis",
//       "zip": "55413"
//     },
//     "orderInfo": {
//       "id": "99",
//       "status": "placed",
//       "driverPickup": "1509 Marshall St NE, Minneapolis",
//       "orderduetime": "2003 Grand St NE, Minneapolis"
//     }
//   },
//   {
//     "skippyEmail": "faith@carbonorigins.com",
//     "data": true,
//     "customer":{
//         "firstName": "cus 2 firstName",
//       "lastName": "cus 2 lastName",
//       "lat": 45.001618,
//       "long": -93.267635,
//       "address": "143 13th Ave NE, Minneapolis",
//       "zip": "55413"
//     },
//     "restaurant": {
//       "name": "dummy 2 restaurant",
//       "lat": 45.000958,
//       "long": -93.266736,
//       "address": "165 13th Ave NE, Minneapolis",
//       "zip": "55413"
//     },
//     "orderInfo": {
//       "id": "98",
//       "status": "placed",
//       "driverPickup": "143 13th Ave NE, Minneapolis",
//       "orderduetime": "165 13th Ave NE, Minneapolis"
//     }
//   },
//   {
//       "skippyEmail": "brett@carbonorigins.com",
//     "data": false
//   }
// ]
