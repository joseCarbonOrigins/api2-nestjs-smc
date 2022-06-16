import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeliverLogicService } from '../../external/services/deliver-logic.service';
// schemas
import { Mission } from '../../database/schemas/mission.schema';
import { Skippy } from '../../database/schemas/skippy.schema';
// dto
import { MissionQueryDto } from '../dto/missions.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
    private dl: DeliverLogicService,
  ) {}

  async getDashboardInfo(): Promise<any> {
    try {
      const skippys: string[] = [
        'sol@carbonorigins.com',
        'brett@carbonorigins.com',
        'faith@carbonorigins.com',
      ];
      let fullResponse: any = {};
      const skippysResponse: any[] = [];

      const skipstersResponse: any = [
        {
          isActive: false,
          name: 'Lungz B',
          controlling: 'Fatih',
          controlling_skippy_image_url: 'https://i.ibb.co/djNnsS7/diet1.png',
          last_seen: '1 hour ago',
          active_for: '20 mins',
          order_status: 'Enroute',
          order_number: 187,
        },
      ];

      for (const skippyIndex in skippys) {
        let newSkippy: any = {
          name:
            skippys[skippyIndex]
              .replace('@carbonorigins.com', '')
              .charAt(0)
              .toUpperCase() +
            skippys[skippyIndex].replace('@carbonorigins.com', '').slice(1),
        };
        const response = await this.dl.getAllOrdersDriver(skippys[skippyIndex]);

        if (response.data.INPROGRESS) {
          const order = response.data.INPROGRESS[0];
          newSkippy = {
            ...newSkippy,
            isActive: true,
            order_status: order.status,
            order_number: order.oid,
            restaurant_name: order.pickup.NAME,
            customer_name: `${order.dropoff.FNAME} ${order.dropoff.LNAME}`,
            // dummy data
            controlled_by: '',
            skippy_image: 'https://i.ibb.co/djNnsS7/diet1.png',
            lat: 44.985135,
            long: -93.229886,
            battery_level: 80,
            connectivity: 20,
            speed: 10.4,
          };
        } else {
          newSkippy = {
            ...newSkippy,
            isActive: false,
            order_status: '',
            order_number: '',
            restaurant_name: '',
            customer_name: '',
            // dummy data
            controlled_by: '',
            skippy_image: 'https://i.ibb.co/djNnsS7/diet1.png',
            lat: 44.985135,
            long: -93.229886,
            battery_level: 80,
            connectivity: 20,
            speed: 10.4,
          };
        }
        skippysResponse.push(newSkippy);
      }
      fullResponse = {
        Skippy: skippysResponse,
        Skipster: skipstersResponse,
      };
      return fullResponse;
    } catch (error) {
      console.log(error);
      return { error: 'error' };
    }
  }

  async getMissions(skip: number): Promise<any> {
    try {
      const missions = await this.missionModel
        .find({})
        .select('_id mission_name mock startTime endTime mission_completed')
        .limit(10)
        .skip(skip)
        .sort({ _id: 'desc' })
        .populate({
          path: 'skipster_id',
          select: 'nickname -_id',
        })
        .populate({
          path: 'skip_id',
          select: 'skippy_id -_id',
          populate: {
            path: 'skippy_id',
            select: 'name -_id',
          },
        });

      const response = {
        data: missions,
      };

      return response;
    } catch (e) {
      throw new NotFoundException('Could not find missions');
    }
  }

  async forceFinishMissions(body: MissionQueryDto): Promise<any> {
    try {
      const { mission_id } = body;

      const finishedMission = await this.missionModel.findByIdAndUpdate(
        mission_id,
        {
          mission_completed: true,
        },
      );
      const previousMission = await this.missionModel.findOneAndUpdate(
        {
          previous_mission_id: finishedMission._id,
        },
        { previous_mission_completed: true },
      );

      if (previousMission === null) {
        await this.skippyModel.findOneAndUpdate(
          {
            current_skip_id: finishedMission.skip_id,
          },
          {
            current_skip_id: null,
          },
        );
      }

      return { message: 'mission finished' };
    } catch (e) {
      throw new NotFoundException('Could not force finish mission');
    }
  }
}
