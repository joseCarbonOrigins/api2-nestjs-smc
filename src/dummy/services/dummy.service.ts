import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//schemas
import { Mission } from '../../database/schemas/mission.schema';
import { Skippy } from '../../database/schemas/skippy.schema';
import { Skip } from '../../database/schemas/skip.schema';
import { FunctionsService } from '../../external/services/functions.service';

@Injectable()
export class DummyService {
  constructor(
    @InjectModel(Skip.name) private skipModel: Model<Skip>,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
    private functionService: FunctionsService,
  ) {}

  async createDummyMissions(payload: any): Promise<any> {
    const { customerInfo, restaurantInfo, skippyName } = payload;

    try {
      const today = new Date();
      // if skippy is not busy
      const skippy = await this.skippyModel.findOne({
        email: skippyName,
        current_skip_id: null,
      });

      if (skippy) {
        const orderInfo = {
          order_id: 99,
          status: 'placed',
          customer: {
            firstName: 'Dummy Customer',
            lastName: 'Dummy Customer',
            lat: customerInfo.lat,
            long: customerInfo.long,
            address: customerInfo.address,
            zip: 55413,
            phone: customerInfo.phone,
          },
          restaurant: {
            name: restaurantInfo.name,
            lat: restaurantInfo.lat,
            long: restaurantInfo.long,
            address: restaurantInfo.address,
            zip: 55413,
          },
        };

        // create random unlock_code
        const pinCode = this.functionService.generateRandomUnlockCode();

        const newSkip = new this.skipModel({
          startTime: today,
          skippy_id: skippy._id,
          order_info: orderInfo,
          mock: true,
          unlock_code: pinCode,
        });
        await newSkip.save();

        await this.skippyModel.findByIdAndUpdate(skippy._id, {
          current_skip_id: newSkip._id,
        });

        // slice into missions
        // creating mission-1

        const newMission1 = new this.missionModel({
          mission_name: 'Driving to merchant',
          // DUMMY START POINT
          // ADD: experience, coins
          start_point: {
            type: 'Point',
            coordinates: [45.0004353, -93.2705556],
          },
          ending_point: {
            type: 'Point',
            coordinates: [restaurantInfo.lat, restaurantInfo.long],
          },
          start_address_name: 'NOT PROVIDED YET',
          ending_address_name: restaurantInfo.address,
          skip_id: newSkip._id,

          // fake values
          mission_xp: 15,
          mission_coins: 15,
          estimated_time: 900,

          mission_completed: false,
          previous_mission_completed: true,
          previous_mission_id: null,
          mock: true,

          startTime: null,
          endTime: null,
          skipster_id: null,
        });

        // creating mission-2
        const newMission2 = new this.missionModel({
          mission_name: 'Driving to customer',
          start_point: {
            type: 'Point',
            coordinates: [restaurantInfo.lat, restaurantInfo.long],
          },
          ending_point: {
            type: 'Point',
            coordinates: [customerInfo.lat, customerInfo.long],
          },
          start_address_name: restaurantInfo.address,
          ending_address_name: customerInfo.address,
          skip_id: newSkip._id,

          // fake values
          mission_xp: 15,
          mission_coins: 15,
          estimated_time: 900,

          mission_completed: false,
          previous_mission_completed: false,
          previous_mission_id: newMission1._id,
          mock: true,

          startTime: null,
          endTime: null,
          skipster_id: null,
        });

        // creating mission-3
        const newMission3 = new this.missionModel({
          mission_name: 'Driving Home',
          start_point: {
            type: 'Point',
            coordinates: [customerInfo.lat, customerInfo.long],
          },
          ending_point: {
            type: 'Point',
            coordinates: [45.000674262505754, -93.26999691463327],
          },
          start_address_name: customerInfo.address,
          ending_address_name: '1317 County Rd 23, Minneapolis, MN 55413, USA',
          skip_id: newSkip._id,

          // fake values
          mission_xp: 15,
          mission_coins: 15,
          estimated_time: 900,

          mission_completed: false,
          previous_mission_completed: false,
          previous_mission_id: newMission2._id,
          mock: true,

          startTime: null,
          endTime: null,
          skipster_id: null,
        });

        await newMission1.save();
        await newMission2.save();
        await newMission3.save();
      }

      // const missions = await this.missionModel
      //   .find({
      //     mission_completed: false,
      //     previous_mission_completed: true,
      //     skipster_id: null,
      //   })
      //   .select(
      //     '_id mission_name mission_xp mission_coins estimated_time start_point ending_point start_address_name ending_address_name mock',
      //   )
      //   .populate({
      //     path: 'skip_id',
      //     select: 'skippy_id -_id',
      //     populate: {
      //       path: 'skippy_id',
      //       select: 'name email -_id',
      //     },
      //   });

      // const lambdaPayload = {
      //   case: 'new_mission',
      //   data: missions.length === 0 ? false : true,
      //   missions: missions,
      // };

      // excecute lambda function
      // this.lambdaService.invokeLambda(lambdaPayload);

      return { message: 'missions created', success: true };
    } catch (error) {
      console.log('error: ', error);
      throw new NotFoundException('Error creating dummy missions');
    }
  }
}
