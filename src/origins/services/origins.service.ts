import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// dtos
import {
  PickMissionDto,
  UpdateMissionOrderStatusDto,
} from '../dtos/missions.dto';
// external services
import { DeliverLogicService } from '../../external/services/deliver-logic.service';
import { TwilioService } from '../../external/services/twilio.service';
//schemas
import { Skipster } from 'src/database/schemas/skipster.schema';
import { Skip } from 'src/database/schemas/skip.schema';
import { Mission } from 'src/database/schemas/mission.schema';
import { Skippy } from 'src/database/schemas/skippy.schema';

@Injectable()
export class OriginsService {
  constructor(
    @InjectModel(Skipster.name) private skipsterModel: Model<Skipster>,
    @InjectModel(Skip.name) private skipModel: Model<Skip>,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
    private twilio: TwilioService,
    private dl: DeliverLogicService,
  ) {}

  async getAvailableMissions(): Promise<any> {
    try {
      // get skippies that not are doing skip
      const skippies = await this.skippyModel.find({ current_skip_id: null });

      for await (const skippy of skippies) {
        // ask DL to get current order for skippy
        const dlResponse = await this.dl.getAllOrdersDriver(skippy.email);

        // if there is an order, create new skip and slice into missions
        if (dlResponse.data.INPROGRESS) {
          const dlOrder: any = dlResponse.data.INPROGRESS[0];
          // CREATE NEW SKIP AND ORDER
          const orderInfo = {
            order_id: dlOrder.oid,
            status: dlOrder.status,
            customer: {
              firstName: dlOrder.dropoff.FNAME,
              lastName: dlOrder.dropoff.LNAME,
              lat: dlOrder.dropoff.LAT,
              long: dlOrder.dropoff.LONG,
              address: dlOrder.dropoff.ADDRESS1,
              zip: dlOrder.dropoff.ZIP,
            },
            restaurant: {
              name: dlOrder.pickup.NAME,
              lat: dlOrder.pickup.LAT,
              long: dlOrder.pickup.LONG,
              address: dlOrder.pickup.ADDRESS1,
              zip: dlOrder.pickup.ZIP,
            },
          };
          const newSkip = new this.skipModel({
            startTime: dlOrder.start_time,
            skippy_id: skippy._id,
            order_info: orderInfo,
          });
          await newSkip.save();
          await this.skippyModel.findByIdAndUpdate(skippy._id, {
            current_skip_id: newSkip._id,
          });

          // slice into missions
          const newMission1: any = new this.missionModel({
            mission_name: 'Driving to merchant',
            // DUMMY START POINT
            // ADD: experience, coins
            start_point: skippy.location,
            ending_point: {
              type: 'Point',
              coordinates: [dlOrder.pickup.LAT, dlOrder.pickup.LONG],
            },
            start_address_name: 'NOT PROVIDED YET',
            ending_address_name: dlOrder.pickup.ADDRESS1,
            skip_id: newSkip._id,

            // fake values
            mission_xp: 15,
            mission_coins: 15,
            estimated_time: 900,

            mission_completed: false,
            previous_mission_completed: true,
            previous_mission_id: null,
          });
          const newMission2 = new this.missionModel({
            mission_name: 'Driving to customer',
            start_point: {
              type: 'Point',
              coordinates: [dlOrder.pickup.LAT, dlOrder.pickup.LONG],
            },
            ending_point: {
              type: 'Point',
              coordinates: [dlOrder.dropoff.LAT, dlOrder.dropoff.LONG],
            },
            start_address_name: dlOrder.pickup.ADDRESS1,
            ending_address_name: dlOrder.dropoff.ADDRESS1,
            skip_id: newSkip._id,

            // fake values
            mission_xp: 15,
            mission_coins: 15,
            estimated_time: 900,

            mission_completed: false,
            previous_mission_completed: false,
            previous_mission_id: newMission1._id,
          });
          await newMission1.save();
          await newMission2.save();
        }
      }

      // returning incompleted missions
      const missions = await this.missionModel.find({
        // TODO: missions that are not assigned to any skipster
        mission_completed: false,
        previous_mission_completed: true,
        skipster_id: null,
      });

      return missions;
    } catch (error) {
      console.log('error: ', error);
      throw new InternalServerErrorException('Error getting all missions');
    }
  }

  async pickAMission(payload: PickMissionDto): Promise<any> {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();
      let skipster_id = null;

      const skipster = await this.skipsterModel.findOne({
        nickname: skipster_nickname,
      });

      if (!skipster || skipster === null) {
        const newSkipster = new this.skipsterModel({
          nickname: skipster_nickname,
          status: 'busy',
          lastSeen: todayDate,
          // fake experience
          experience: 10,
          // fake level
          level: 1,
        });
        await newSkipster.save();
        skipster_id = newSkipster._id;
      } else {
        skipster_id = skipster._id;
      }

      const missionPicked = await this.missionModel.findByIdAndUpdate(
        mission_id,
        {
          skipster_id: skipster_id,
          startTime: todayDate,
        },
      );
      const skip = await this.skipModel.findById(missionPicked.skip_id);

      return {
        mission: missionPicked,
        order_id: skip.order_info.order_id,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error on picking a mission');
    }
  }

  async getSkippyOrder(skippyname: string): Promise<object> {
    let responseData: object = {};

    try {
      const dlResponse = await this.dl.getAllOrdersDriver(skippyname);

      if (dlResponse.data.INPROGRESS) {
        const order = dlResponse.data.INPROGRESS[0];

        responseData = {
          dataExists: true,
          customer: {
            firstName: order.dropoff.FNAME,
            lastName: order.dropoff.LNAME,
            lat: order.dropoff.LAT,
            long: order.dropoff.LONG,
            address: order.dropoff.ADDRESS1,
            zip: order.dropoff.ZIP,
          },
          restaurant: {
            name: order.pickup.NAME,
            lat: order.pickup.LAT,
            long: order.pickup.LONG,
            address: order.pickup.ADDRESS1,
            zip: order.pickup.ZIP,
          },
          orderInfo: {
            id: order.oid,
            status: order.status,
            driverPickup: order.driverpickup,
            orderduetime: order.orderduetime,
          },
        };
      } else {
        responseData = {
          dataExists: false,
        };
      }

      return responseData;
    } catch (error) {
      throw new InternalServerErrorException('Error getting skippy order');
    }
  }

  async updateMissionOrderStatus(payload: UpdateMissionOrderStatusDto) {
    try {
      const { status, orderid, skippyname, location, mission_id } = payload;
      const todayDate = new Date();
      const newLocation = {
        type: 'Point',
        coordinates: [location.lat, location.long],
      };
      const dlUpdateOrderStatus = await this.dl.updateOrderStatus(
        skippyname,
        orderid,
        status,
      );

      const updateStatusJson = dlUpdateOrderStatus.data;

      const dlGetOrder = await this.dl.getAnOrder(skippyname, orderid);
      const getOrderInfo = dlGetOrder.data;
      const dlGetDriver = await this.dl.getDriverInfo(skippyname);
      const getDriverInfo = dlGetDriver.data;

      const restaurantPhone = `+1${getOrderInfo.restaurant[0].PHONE}`;
      const customerPhone = `+1${getOrderInfo.user.PHONE}`;
      const customerName = `${getOrderInfo.user.FNAME}`;
      const skippyColor = `${getDriverInfo.lname}`;

      switch (status) {
        case 'ARRIVED':
          await this.skippyModel.findOneAndUpdate(
            { email: skippyname },
            {
              mission: 'waiting merchant',
              status: status,
              location: newLocation,
            },
          );
          // ends 1st mission
          const endedMission = await this.missionModel.findByIdAndUpdate(
            mission_id,
            {
              mission_completed: true,
              endTime: todayDate,
            },
          );
          await this.missionModel.findOneAndUpdate(
            { previous_mission_id: endedMission._id },
            {
              previous_mission_completed: true,
            },
          );

          this.twilio.makeACall(
            restaurantPhone,
            'Hello. Skippy. is at your restaurant',
          );

          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Skippy is at your restaurant`,
          );
          break;
        case 'ENROUTE':
          await this.skippyModel.findOneAndUpdate(
            { email: skippyname },
            {
              mission: 'driving delivery',
              status: status,
              location: newLocation,
            },
          );
          // starts 2nd mission
          await this.missionModel.findByIdAndUpdate(mission_id, {
            startTime: todayDate,
          });

          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Your order is on its way to your house. The color of your Skippy is ${skippyColor}`,
          );

          break;
        case 'DELIVERED':
          await this.skippyModel.findOneAndUpdate(
            { email: skippyname },
            {
              mission: 'waiting delivery',
              status: status,
              current_skip_id: null,
              location: newLocation,
            },
          );

          // ends 2nd mission
          await this.missionModel.findByIdAndUpdate(mission_id, {
            mission_completed: true,
            endTime: todayDate,
          });

          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Your order is at your door. The color of your Skippy is ${skippyColor} :)`,
          );

          break;
        default:
          break;
      }
      return updateStatusJson;
    } catch (error) {
      throw new InternalServerErrorException('Error updating order status');
    }
  }
}
