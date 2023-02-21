/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // aws
import { LambdaService } from '../../external/services/lambda.service';
import { FunctionsService } from '../../external/services/functions.service';
// dtos
import {
  PickMissionDto,
  UpdateMissionOrderStatusDto,
  UpdateMissionStatus,
  AcceptDeclineMissionDto,
} from '../dtos/missions.dto';
import { CamerasArrangementDto } from '../dtos/skippy.dto';
import { SubmitEventDto } from '../dtos/event.dto';
// external services
import { DeliverLogicService } from '../../external/services/deliver-logic.service';
import { TwilioService } from '../../external/services/twilio.service';
import { OriginsDaoService } from '../data/origins-dao.service';
import { LockingMechanismService } from 'src/external/services/locking-mechanism.service';
// schemas
import { Skippy } from '../../database/schemas/skippy.schema';
import { Skipster } from '../../database/schemas/skipster.schema';
import { Event } from '../../database/schemas/event.schema';
import { Skip } from 'src/database/schemas/skip.schema';

@Injectable()
export class OriginsService {
  constructor(
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
    @InjectModel(Skipster.name) private skipsterModel: Model<Skipster>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Skip.name) private skipModel: Model<Skip>,
    private originsData: OriginsDaoService,
    private twilio: TwilioService,
    private dl: DeliverLogicService,
    private lambdaService: LambdaService,
    private lockingService: LockingMechanismService,
    private functionService: FunctionsService,
  ) {}

  async getAvailableMissions(): Promise<any> {
    try {
      // returning incompleted missions
      const missions = await this.originsData.getMissions({
        mission_completed: false,
        previous_mission_completed: true,
        skipster_id: null,
      });

      return missions;
    } catch (error) {
      console.log('error: ', error);
      throw new NotFoundException('Error getting all missions');
    }
  }

  async pickAMission(payload: PickMissionDto): Promise<any> {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();
      // let skipster_id = null;
      let newSkipster = null;
      const skipster = await this.originsData.getSkipster({
        nickname: skipster_nickname,
      });

      // ask if skipster is new
      if (!skipster || skipster === null) {
        // creates new skipster
        const newSkipster1 = await this.originsData.createSkipster({
          nickname: skipster_nickname,
          status: 'busy',
          lastSeen: todayDate,
        });
        newSkipster = newSkipster1;
      } else {
        newSkipster = skipster;
      }

      const missionPicked = await this.originsData.updateMission(
        {
          _id: mission_id,
          skipster_id: null,
        },
        {
          skipster_id: newSkipster._id,
          startTime: todayDate,
        },
      );

      if (!missionPicked) {
        throw new NotFoundException('Mission already picked');
      }

      // udpate skipster with new mission picked
      await this.originsData.pushMissionIdInsideSkipster(
        newSkipster._id,
        missionPicked._id,
      );

      // STARTING MISSION 1
      if (missionPicked.mission_name === 'Driving to merchant') {
        // send locking mechanism payload to skippy
        await this.lockingService.sendLockingPayload(
          missionPicked.skip_id.skippy_id.ip_address,
          'driving_merchant',
          1234,
          `${missionPicked.skip_id.order_info.customer.firstName} ${missionPicked.skip_id.order_info.customer.lastName}`,
        );
      }

      // STARTING MISSION 2
      if (missionPicked.mission_name === 'Driving to customer') {
        // send locking mechanism payload to skippy
        await this.lockingService.sendLockingPayload(
          missionPicked.skip_id.skippy_id.ip_address,
          'driving_customer',
          1234,
          `${missionPicked.skip_id.order_info.customer.firstName} ${missionPicked.skip_id.order_info.customer.lastName}`,
        );

        // update order status based on mission picked up
        if (!missionPicked.mock) {
          await this.dl.updateOrderStatus(
            missionPicked.skip_id.skippy_id.email,
            missionPicked.skip_id.order_info.order_id,
            'ENROUTE',
          );
        }
      }
      return {
        mission: missionPicked,
      };
    } catch (error) {
      console.log('PICK MISSION ERROR', error);
      throw new InternalServerErrorException('Mission not picked');
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

  // end mission-1
  async foodPlaced(payload: UpdateMissionStatus) {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();

      // calculate driving time
      const mission = await this.originsData.getMissionById(mission_id);
      const drivingTime = this.functionService.calculateDrivingTime(
        mission.startTime,
        todayDate,
      );

      const endedMission = await this.originsData.updateMissionById(
        mission_id,
        {
          mission_completed: true,
          endTime: todayDate,
          driving_time: drivingTime,
        },
      );

      // update mission to completed
      await this.originsData.updateMission(
        {
          previous_mission_id: endedMission._id,
        },
        { previous_mission_completed: true },
      );

      //  call lambda function
      const lambdaPayload = {
        case: 'end_mission',
        mission: {
          id: mission_id,
        },
        skipster: {
          name: skipster_nickname,
        },
      };
      this.lambdaService.invokeLambda(lambdaPayload);

      await this.skipsterModel.findByIdAndUpdate(mission.skipster_id, {
        $inc: {
          driving_time: drivingTime,
        },
      });

      return { message: 'mission1 ended' };
    } catch (e) {
      throw new InternalServerErrorException('Error updating order status');
    }
  }

  // end mission-2
  async foodDelivered(payload: UpdateMissionStatus) {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();

      // calculate driving time
      const mission = await this.originsData.getMissionById(mission_id);
      const drivingTime = this.functionService.calculateDrivingTime(
        mission.startTime,
        todayDate,
      );

      const endedMission = await this.originsData.updateMissionById(
        mission_id,
        {
          mission_completed: true,
          endTime: todayDate,
          driving_time: drivingTime,
        },
      );

      // update mission to completed
      await this.originsData.updateMission(
        {
          previous_mission_id: endedMission._id,
        },
        { previous_mission_completed: true },
      );

      // send locking mechanism payload to skippy
      await this.lockingService.sendLockingPayload(
        endedMission.skip_id.skippy_id.ip_address,
        'arrived_customer',
        1234,
        `${endedMission.skip_id.order_info.customer.firstName} ${endedMission.skip_id.order_info.customer.lastName}`,
      );

      // UPDATE ORDER STATUS
      if (!endedMission.mock) {
        await this.dl.updateOrderStatus(
          endedMission.skip_id.skippy_id.email,
          endedMission.skip_id.order_info.order_id,
          'DELIVERED',
        );
      }

      //  call lambda function
      const lambdaPayload = {
        case: 'end_mission',
        mission: {
          id: mission_id,
        },
        skipster: {
          name: skipster_nickname,
        },
      };
      this.lambdaService.invokeLambda(lambdaPayload);

      await this.skipsterModel.findByIdAndUpdate(mission.skipster_id, {
        $inc: {
          driving_time: drivingTime,
        },
      });

      return { message: 'mission2 ended' };
    } catch (e) {
      console.log('END MISSION 2 ERROR ', e);
      throw new InternalServerErrorException('Error updating order status');
    }
  }

  // end mission-3
  async backToHome(payload: UpdateMissionStatus) {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();

      // calculate driving time
      const mission = await this.originsData.getMissionById(mission_id);
      const drivingTime = this.functionService.calculateDrivingTime(
        mission.startTime,
        todayDate,
      );

      const endedMission = await this.originsData.updateMissionById(
        mission_id,
        {
          mission_completed: true,
          endTime: todayDate,
          driving_time: drivingTime,
        },
      );

      await this.originsData.updateSkippy(
        {
          current_skip_id: endedMission.skip_id._id,
        },
        {
          current_skip_id: null,
        },
      );

      //  call lambda function
      const lambdaPayload = {
        case: 'end_mission',
        mission: {
          id: mission_id,
        },
        skipster: {
          name: skipster_nickname,
        },
      };
      this.lambdaService.invokeLambda(lambdaPayload);

      await this.skipsterModel.findByIdAndUpdate(mission.skipster_id, {
        $inc: {
          driving_time: drivingTime,
        },
      });

      await this.skipModel.findByIdAndUpdate(endedMission.skip_id._id, {
        endTime: todayDate,
      });

      return { message: 'mission3 ended' };
    } catch (e) {
      throw new InternalServerErrorException('Error ending mission3');
    }
  }

  async updateMissionOrderStatus(payload: UpdateMissionOrderStatusDto) {
    try {
      const { status, orderid, location, skippyname, mission_id } = payload;
      // const todayDate = new Date();
      const newLocation = {
        type: 'Point',
        coordinates: [location.lat, location.long],
      };
      const skippy = await this.originsData.getSkippyByEmail(skippyname);

      const skipInfo = await this.originsData.getSkipById(
        skippy.current_skip_id,
      );
      const customerPhone = `${skipInfo.order_info.customer.phone}`;
      const customerName = `${skipInfo.order_info.customer.firstName} ${skipInfo.order_info.customer.lastName}`;
      const skippyName = skippy.name;

      switch (status) {
        case 'ARRIVED':
          await this.originsData.updateSkippy(
            { email: skippyname },
            {
              mission: 'waiting_merchant',
              status: status,
              location: newLocation,
            },
          );

          if (!skipInfo.mock) {
            // update on DL
            await this.dl.updateOrderStatus(skippyname, orderid, status);
          }

          // update on skip -> order_info status
          await this.originsData.updateSkipById(skippy.current_skip_id, {
            $set: { 'order_info.status': status },
          });

          // send locking mechanism payload to skippy
          await this.lockingService.sendLockingPayload(
            skippy.ip_address,
            'arrived_merchant',
            1234,
            customerName,
          );

          // if (getDriverInfo.restaurant[0].NAME !== 'Element Pizza') {
          //   this.twilio.makeACall(
          //     restaurantPhone,
          //     'Hello. Skippy. is at your restaurant',
          //   );
          // }

          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Skippy is at the restaurant waiting for your food !!!`,
          );
          break;
        case 'ENROUTE':
          await this.originsData.updateSkippy(
            { email: skippyname },
            {
              mission: 'driving_delivery',
              status: status,
              location: newLocation,
            },
          );

          if (!skipInfo.mock) {
            // update on DL
            await this.dl.updateOrderStatus(skippyname, orderid, status);
          }

          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Your order is on its way to your house. The color of your Skippy is ${skippyName}`,
          );

          break;
        case 'DELIVERED':
          await this.originsData.updateSkippy(
            { email: skippyname },
            {
              mission: 'waiting_delivery',
              status: status,
              location: newLocation,
            },
          );

          break;

        case 'ARRIVED_CUSTOMER':
          await this.originsData.updateSkippy(
            { email: skippyname },
            {
              mission: 'arrived_customer',
              status: status,
              location: newLocation,
            },
          );
          // update on skip -> order_info status
          const skip = await this.originsData.updateSkipById(
            skippy.current_skip_id,
            {
              $set: { 'order_info.status': status },
            },
          );

          // send sms notification to customer
          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Your order is at your door. The pin code for the robot is ${skip.unlock_code}`,
          );

          // send locking mechanism payload to skippy
          await this.lockingService.sendLockingPayload(
            skippy.ip_address,
            'arrived_customer',
            skip.unlock_code,
            customerName,
          );
          break;

        default:
          break;
      }
      return { message: 'updated' };
    } catch (error) {
      console.log('Error updating order status', error);
      throw new InternalServerErrorException('Error updating order status');
    }
  }

  // async oldUpdateOrderStatus(
  //   skippyname: string,
  //   orderid: number,
  //   status: string,
  // ) {
  //   try {
  //     const updatedStatus = await this.dl.updateOrderStatus(
  //       skippyname,
  //       orderid,
  //       status,
  //     );
  //     const updateStatusJson = updatedStatus.data;

  //     const getOrder = await this.dl.getAnOrder(skippyname, orderid);
  //     const getOrderInfo = getOrder.data;

  //     const getDriver = await this.dl.getDriverInfo(skippyname);
  //     const getDriverInfo = getDriver.data;

  //     const restaurantPhone = `+1${getOrderInfo.restaurant[0].PHONE}`;
  //     const customerPhone = `+1${getOrderInfo.user.PHONE}`;
  //     const customerName = `${getOrderInfo.user.FNAME}`;
  //     const skippyColor = `${getDriverInfo.lname}`;

  //     switch (status) {
  //       case 'ARRIVED':
  //         if (getDriverInfo.restaurant[0].NAME !== 'Element Pizza') {
  //           this.twilio.makeACall(
  //             restaurantPhone,
  //             'Hello. Skippy. is at your restaurant',
  //           );
  //         }
  //         this.twilio.sendSMS(
  //           customerPhone,
  //           `Hello ${customerName}. Skippy arrived to the restaurant.`,
  //         );
  //         break;
  //       case 'ENROUTE':
  //         this.twilio.sendSMS(
  //           customerPhone,
  //           `Hello ${customerName}. Your order is on its way to your house. The color of your Skippy is ${skippyColor}`,
  //         );
  //         break;
  //       case 'DELIVERED':
  //         this.twilio.sendSMS(
  //           customerPhone,
  //           `Hello ${customerName}. Your order is at your door. The color of your Skippy is ${skippyColor} :)`,
  //         );
  //         break;
  //       default:
  //     }

  //     return updateStatusJson;
  //   } catch (e) {
  //     throw new NotFoundException('Error updating order status');
  //   }
  // }

  async unassignMission(payload: UpdateMissionStatus): Promise<any> {
    // disengage from mission
    try {
      const { mission_id, skipster_nickname } = payload;
      const mission = await this.originsData.updateMissionById(mission_id, {
        skipster_id: null,
        mission_completed: false,
      });

      await this.originsData.removeMissionIdInsideSkipster(
        mission.skipster_id,
        mission._id,
      );

      //  call lambda function
      const lambdaPayload = {
        case: 'disengage_mission',
        mission: {
          id: mission_id,
        },
        skipster: {
          name: skipster_nickname,
        },
      };
      this.lambdaService.invokeLambda(lambdaPayload);

      return { message: 'mission unassigned' };
    } catch (error) {
      throw new InternalServerErrorException('Error unassigning order');
    }
  }

  async acceptMission(payload: AcceptDeclineMissionDto): Promise<any> {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();
      let newSkipster = null;
      const skipster = await this.originsData.getSkipster({
        nickname: skipster_nickname,
      });

      if (!skipster || skipster === null) {
        // creates new skipster
        const newSkipster1 = await this.originsData.createSkipster({
          nickname: skipster_nickname,
          status: 'busy',
          lastSeen: todayDate,
          // fake experience
          experience: 10,
          // fake level
          level: 1,
        });
        newSkipster = newSkipster1;
      } else {
        newSkipster = skipster;
      }

      // pick/accept mission if mission is not picked/accepted
      const missionPicked = await this.originsData.updateMission(
        {
          _id: mission_id,
          skipster_id: null,
        },
        {
          skipster_id: newSkipster._id,
          startTime: todayDate,
        },
      );

      if (!missionPicked) {
        throw new NotFoundException('Mission already picked');
      }

      // udpate skipster with new mission accepted
      await this.originsData.pushMissionIdInsideSkipster(
        newSkipster._id,
        missionPicked._id,
      );
      // update skippy with new mission accepted
      await this.originsData.pushMissionIdInsideSkippy(
        missionPicked.skip_id.skippy_id._id,
        missionPicked._id,
      );
      // STARTING MISSION 1
      // SEND LOCKING MECHANISM PAYLOAD

      // STARTING MISSION 2
      if (missionPicked.mission_name === 'Driving to customer') {
        this.twilio.sendSMS(
          missionPicked.skip_id.order_info.customer.phone,
          `Hello ${missionPicked.skip_id.order_info.customer.firstName}. Your order is on its way to your house.`,
        );
        // update order status based on mission picked up
        if (!missionPicked.mock) {
          await this.dl.updateOrderStatus(
            missionPicked.skip_id.skippy_id.email,
            missionPicked.skip_id.order_info.order_id,
            'ENROUTE',
          );
          // send locking mechanism payload to skippy
          await this.lockingService.sendLockingPayload(
            missionPicked.skip_id.skippy_id.ip_address,
            'driving_customer',
            1122,
            `${missionPicked.skip_id.order_info.customer.firstName} ${missionPicked.skip_id.order_info.customer.lastName}`,
          );
        }
      }

      //  call lambda function
      const lambdaPayload = {
        case: 'accept_mission',
        skipster: {
          name: skipster_nickname,
        },
        mission: {
          id: mission_id,
        },
      };
      this.lambdaService.invokeLambda(lambdaPayload);

      return { message: 'mission accepted', mission: missionPicked };
    } catch (error) {
      console.log('error accepting the mission ', error);
      throw new InternalServerErrorException('Error accepting the mission');
    }
  }

  async declineMission(payload: AcceptDeclineMissionDto): Promise<any> {
    try {
      const { mission_id, skipster_nickname } = payload;
      const lambdaPayload = {
        case: 'decline_mission',
        skipster: {
          name: skipster_nickname,
        },
        mission: {
          id: mission_id,
        },
      };
      this.lambdaService.invokeLambda(lambdaPayload);
      return { message: 'mission declined' };
    } catch (error) {
      throw new InternalServerErrorException('Error declining the mission');
    }
  }

  async getSkippyData(skippyname: string): Promise<any> {
    try {
      const theSkippy = await this.skippyModel
        .where({
          email: skippyname,
        })
        .select(
          '-_id name email ip_address cameras_arrangement agora_channel type connection_url',
        );
      const skippyData = {
        name: theSkippy[0].name,
        email: theSkippy[0].email,
        ip_address: theSkippy[0].ip_address,
        cameras_arrangement: theSkippy[0].cameras_arrangement,
        agora_channel: theSkippy[0].agora_channel,
        type: theSkippy[0].type,
        connection_url: theSkippy[0].connection_url,
      };
      return skippyData;
    } catch (error) {
      throw new InternalServerErrorException(
        'getSkippyData - Couldnt return skippy data',
      );
    }
  }

  async getSkippyDataName(skippyname: string): Promise<any> {
    try {
      const theSkippy = await this.skippyModel
        .where({
          name: skippyname,
        })
        .select(
          '-_id name email ip_address cameras_arrangement agora_channel type connection_url',
        );
      const skippyData = {
        name: theSkippy[0].name,
        email: theSkippy[0].email,
        ip_address: theSkippy[0].ip_address,
        cameras_arrangement: theSkippy[0].cameras_arrangement,
        agora_channel: theSkippy[0].agora_channel,
        type: theSkippy[0].type,
        connection_url: theSkippy[0].connection_url,
      };
      return skippyData;
    } catch (error) {
      throw new InternalServerErrorException(
        'getSkippyData - Couldnt return skippy data',
      );
    }
  }

  async setSkippyCameras(
    skippyname: string,
    arrange: CamerasArrangementDto,
  ): Promise<any> {
    try {
      const theSkippy = await this.skippyModel.findOneAndUpdate(
        { email: skippyname },
        { cameras_arrangement: arrange.cameras },
      );
      const response = (({ name, email }) => ({
        name,
        email,
      }))(theSkippy);
      Object.assign(response, { cameras_arrangement: arrange.cameras });
      return response;
    } catch (error) {
      throw new InternalServerErrorException(
        'setSkippyCameras - Couldnt change cameras arrangement',
      );
    }
  }

  async getAllSkippies(city?: string): Promise<any> {
    try {
      const Skippies = await this.skippyModel
        .find(city ? { city: city } : {})
        .select(
          '_id name email mission status current_skip_id cameras_arrangement ip_address agora_channel phone_number type connection_url available robot_status city fleet',
        )
        .lean(); // added the lean() method to get plain JS objects

      Skippies.sort((a, b) => {
        if (a._id > b._id) {
          return -1;
        }
        if (a._id < b._id) {
          return 1;
        }
        return 0;
      });
      //remove the _id field from the object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = Skippies.map(({ _id, ...rest }) => rest);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'getAllSkippies - Couldnt return skippy data',
      );
    }
  }

  async submitEvent(payload: SubmitEventDto): Promise<any> {
    try {
      const theSkipster = await this.skipsterModel.findOne({
        nickname: payload.skipster_nickname,
      });
      if (!theSkipster) {
        throw new NotFoundException('Skipster not found');
      }
      const theEvent = await this.eventModel.create({
        skipster_nickname: theSkipster.nickname,
        date: payload.date,
        type: payload.type,
        data: payload.data,
        platform: payload.platform,
      });
      return theEvent;
    } catch (error) {
      throw new InternalServerErrorException(
        'submitEvent - Couldnt submit event',
      );
    }
  }

  async testSMS(payload: any): Promise<any> {
    try {
      const { customerPhone, customerName } = payload;
      this.twilio.sendSMS(
        customerPhone,
        `Hello ${customerName}. Your order is at your door. The pin code for the robot is 1122`,
      );
      return { message: 'message sent' };
    } catch (error) {
      console.error('error sending sms text...', error);
      throw new InternalServerErrorException(
        'Error sending sms text notification',
      );
    }
  }
}
