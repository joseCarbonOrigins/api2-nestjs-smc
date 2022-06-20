import { Injectable, NotFoundException } from '@nestjs/common';
// aws
import { LambdaService } from '../../external/services/lambda.service';
// dtos
import {
  PickMissionDto,
  UpdateMissionOrderStatusDto,
  UpdateMissionStatus,
  AcceptDeclineMissionDto,
} from '../dtos/missions.dto';
// external services
import { DeliverLogicService } from '../../external/services/deliver-logic.service';
import { TwilioService } from '../../external/services/twilio.service';
import { OriginsDaoService } from '../data/origins-dao.service';

@Injectable()
export class OriginsService {
  constructor(
    private originsData: OriginsDaoService,
    private twilio: TwilioService,
    private dl: DeliverLogicService,
    private lambdaService: LambdaService,
  ) {}

  async getAvailableMissions(): Promise<any> {
    try {
      // get skippies that not are doing skip
      const skippies = await this.originsData.getSkippys({
        current_skip_id: null,
      });

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
          const newSkip = await this.originsData.createSkip({
            startTime: dlOrder.start_time,
            skippy_id: skippy._id,
            order_info: orderInfo,
            mock: false,
          });

          await this.originsData.updateSkippyById(skippy._id, {
            current_skip_id: newSkip._id,
          });

          // slice into missions
          // creating mission-1
          const newMission1 = await this.originsData.createMission({
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
            mock: false,

            startTime: null,
            endTime: null,
            skipster_id: null,
          });
          // creating mission-2
          const newMission2 = await this.originsData.createMission({
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
            mock: false,

            startTime: null,
            endTime: null,
            skipster_id: null,
          });

          // creating mission-3
          await this.originsData.createMission({
            mission_name: 'Driving Home',
            start_point: {
              type: 'Point',
              coordinates: [dlOrder.dropoff.LAT, dlOrder.dropoff.LONG],
            },
            ending_point: {
              type: 'Point',
              coordinates: [45.0004353, -93.2705556],
            },
            start_address_name: dlOrder.dropoff.ADDRESS1,
            ending_address_name:
              '1317 County Rd 23, Minneapolis, MN 55413, USA',
            skip_id: newSkip._id,

            // fake values
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
        }
      }

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
      let skipster_id = null;
      const skipster = await this.originsData.getSkipster({
        nickname: skipster_nickname,
      });

      if (!skipster || skipster === null) {
        // creates new skipster
        const newSkipster = await this.originsData.createSkipster({
          nickname: skipster_nickname,
          status: 'busy',
          lastSeen: todayDate,
          // fake experience
          experience: 10,
          // fake level
          level: 1,
        });
        skipster_id = newSkipster._id;
      } else {
        skipster_id = skipster._id;
      }
      const missionPicked = await this.originsData.updateMission(
        {
          _id: mission_id,
          skipster_id: null,
        },
        {
          skipster_id: skipster_id,
          startTime: todayDate,
        },
      );

      if (!missionPicked) {
        throw new NotFoundException('Mission already picked');
      }
      const skip = await this.originsData.getSkipById(missionPicked.skip_id);
      return {
        mission: missionPicked,
        order_id: skip.order_info.order_id,
      };
    } catch (error) {
      throw new NotFoundException('Mission not picked');
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
      throw new NotFoundException('Error getting skippy order');
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
          await this.originsData.updateSkippy(
            { email: skippyname },
            {
              mission: 'waiting merchant',
              status: status,
              location: newLocation,
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
          await this.originsData.updateSkippy(
            { email: skippyname },
            {
              mission: 'driving delivery',
              status: status,
              location: newLocation,
            },
          );

          // starts 2nd mission
          await this.originsData.updateMissionById(mission_id, {
            startTime: todayDate,
          });

          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Your order is on its way to your house. The color of your Skippy is ${skippyColor}`,
          );

          break;
        case 'DELIVERED':
          await this.originsData.updateSkippy(
            { email: skippyname },
            {
              mission: 'waiting delivery',
              status: status,
              current_skip_id: null,
              location: newLocation,
            },
          );

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
      throw new NotFoundException('Error updating order status');
    }
  }

  // end mission-1
  async foodPlaced(payload: UpdateMissionStatus) {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();

      const endedMission = await this.originsData.updateMissionById(
        mission_id,
        { mission_completed: true, endTime: todayDate },
      );

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

      return { message: 'mission ended' };
    } catch (e) {
      throw new NotFoundException('Error updating order status');
    }
  }

  // end mission-2
  async foodDelivered(payload: UpdateMissionStatus) {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();

      const endedMission = await this.originsData.updateMissionById(
        mission_id,
        {
          mission_completed: true,
          endTime: todayDate,
        },
      );

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

      return { message: 'mission ended' };
    } catch (e) {
      throw new NotFoundException('Error updating order status');
    }
  }

  // end mission-3
  async backToHome(payload: UpdateMissionStatus) {
    try {
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();

      const endedMission = await this.originsData.updateMissionById(
        mission_id,
        {
          mission_completed: true,
          endTime: todayDate,
        },
      );

      await this.originsData.updateSkippy(
        {
          current_skip_id: endedMission.skip_id,
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

      return { message: 'mission ended' };
    } catch (e) {
      throw new NotFoundException('Error updating order status');
    }
  }

  async oldUpdateOrderStatus(
    skippyname: string,
    orderid: number,
    status: string,
  ) {
    try {
      const updatedStatus = await this.dl.updateOrderStatus(
        skippyname,
        orderid,
        status,
      );
      const updateStatusJson = updatedStatus.data;

      const getOrder = await this.dl.getAnOrder(skippyname, orderid);
      const getOrderInfo = getOrder.data;

      const getDriver = await this.dl.getDriverInfo(skippyname);
      const getDriverInfo = getDriver.data;

      const restaurantPhone = `+1${getOrderInfo.restaurant[0].PHONE}`;
      const customerPhone = `+1${getOrderInfo.user.PHONE}`;
      const customerName = `${getOrderInfo.user.FNAME}`;
      const skippyColor = `${getDriverInfo.lname}`;

      switch (status) {
        case 'ARRIVED':
          if (getDriverInfo.restaurant[0].NAME !== 'Element Pizza') {
            this.twilio.makeACall(
              restaurantPhone,
              'Hello. Skippy. is at your restaurant',
            );
          }
          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Skippy arrived to the restaurant.`,
          );
          break;
        case 'ENROUTE':
          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Your order is on its way to your house. The color of your Skippy is ${skippyColor}`,
          );
          break;
        case 'DELIVERED':
          this.twilio.sendSMS(
            customerPhone,
            `Hello ${customerName}. Your order is at your door. The color of your Skippy is ${skippyColor} :)`,
          );
          break;
        default:
      }

      return updateStatusJson;
    } catch (e) {
      throw new NotFoundException('Error updating order status');
    }
  }

  async unassignMission(payload: UpdateMissionStatus): Promise<any> {
    try {
      const { mission_id } = payload;
      await this.originsData.updateMissionById(mission_id, {
        skipster_id: null,
      });

      return { message: 'mission unassigned' };
    } catch (error) {
      throw new NotFoundException('Error updating order status');
    }
  }

  async acceptMission(payload: AcceptDeclineMissionDto): Promise<any> {
    try {
      // TODO: update mission on our DB
      const { mission_id, skipster_nickname } = payload;
      const todayDate = new Date();
      let skipster_id = null;
      const skipster = await this.originsData.getSkipster({
        nickname: skipster_nickname,
      });

      if (!skipster || skipster === null) {
        // creates new skipster
        const newSkipster = await this.originsData.createSkipster({
          nickname: skipster_nickname,
          status: 'busy',
          lastSeen: todayDate,
          // fake experience
          experience: 10,
          // fake level
          level: 1,
        });
        skipster_id = newSkipster._id;
      } else {
        skipster_id = skipster._id;
      }
      // pick/accept mission if mission is not picked/accepted
      const missionPicked = await this.originsData.updateMission(
        {
          _id: mission_id,
          skipster_id: null,
        },
        {
          skipster_id: skipster_id,
          startTime: todayDate,
        },
      );

      if (!missionPicked) {
        // throw error if mission is picked/accepted by someone else
        throw new NotFoundException('Mission already picked');
      }
      await this.originsData.getSkipById(missionPicked.skip_id);
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
      return { message: 'mission accepted' };
    } catch (error) {
      throw new NotFoundException('Error accepting the mission');
    }
  }

  async declineMission(payload: AcceptDeclineMissionDto): Promise<any> {
    try {
      // TODO: call lambda function, send the mission for someone else
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
      throw new NotFoundException('Error declining the mission');
    }
  }

  // async test(): Promise<any> {
  //   try {
  //     const missions = await this.originsData.getMissions({
  //       // mission_completed: false,
  //       // previous_mission_completed: true,
  //       // skipster_id: null,
  //     });

  //     return missions;
  //   } catch (error) {
  //     console.log('error: ', error);
  //     throw new InternalServerErrorException('Error getting all missions');
  //   }
  // }
}
