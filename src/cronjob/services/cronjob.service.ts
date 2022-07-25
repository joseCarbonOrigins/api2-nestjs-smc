import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
@Injectable()
export class CronjobService {
  constructor(
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
    @InjectModel(Skip.name) private skipModel: Model<Skip>,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    private lambdaService: LambdaService,
  ) {}

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
          'mission_name mission_xp mission_coins estimated_time start_point ending_point start_address_name ending_address_name mock',
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
    // create new skip for skippy
    const newSkip = new this.skipModel({
      startTime: today,
      skippy_id: isSkippyNotBusy._id,
      order_info: oderInfo,
      mock: false,
    });
    await newSkip.save();
    // update skippy with current skip
    await this.skippyModel.findByIdAndUpdate(isSkippyNotBusy._id, {
      current_skip_id: newSkip._id,
    });
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
      mission_coins: 15,
      estimated_time: 900,

      mission_completed: false,
      previous_mission_completed: true,
      previous_mission_id: null,
      mock: false,

      startTime: null,
      endTime: null,
      skipster_id: null,
    });
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
      mission_coins: 15,
      estimated_time: 900,

      mission_completed: false,
      previous_mission_completed: false,
      previous_mission_id: newMission1._id,
      mock: false,

      startTime: null,
      endTime: null,
      skipster_id: null,
    });
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
      mission_coins: 15,
      estimated_time: 900,

      mission_completed: false,
      previous_mission_completed: false,
      previous_mission_id: newMission2._id,
      mock: false,

      startTime: null,
      endTime: null,
      skipster_id: null,
    });
    await newMission1.save();
    await newMission2.save();
    await newMission3.save();
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
