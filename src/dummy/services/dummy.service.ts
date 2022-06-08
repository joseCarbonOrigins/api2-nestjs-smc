import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
//schemas
import { Mission } from '../../database/schemas/mission.schema';
import { Skippy } from '../../database/schemas/skippy.schema';

@Injectable()
export class DummyService {
  constructor(
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
  ) {}

  async getAvailableMissions(payload: any): Promise<any> {
    const { customerInfo, restaurantInfo, skippyName } = payload;

    try {
      // get skippies that not are doing skip
      const orderInfo = {
        order_id: 99,
        status: 'placed',
        customer: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          lat: customerInfo.lat,
          long: customerInfo.long,
          address: customerInfo.address,
          zip: 55413,
        },
        restaurant: {
          name: restaurantInfo.name,
          lat: restaurantInfo.lat,
          long: restaurantInfo.long,
          address: restaurantInfo.address,
          zip: 55413,
        },
        mock: true,
      };

      const newSkip = new this.skippyModel(orderInfo);
      await newSkip.save();

      await this.skippyModel.findOneAndUpdate(
        { email: skippyName },
        { current_skip_id: newSkip._id },
      );

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
          coordinates: [45.0004353, -93.2705556],
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
      });

      await newMission1.save();
      await newMission2.save();
      await newMission3.save();

      return { message: 'missions created' };
    } catch (error) {
      console.log('error: ', error);
      throw new NotFoundException('Error getting all missions');
    }
  }
}
