import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeliverLogicService } from '../../external/services/deliver-logic.service';
// schemas
import { Mission } from '../../database/schemas/mission.schema';
import { Skippy } from '../../database/schemas/skippy.schema';
import { Skipster } from 'src/database/schemas/skipster.schema';
// aws
import { LambdaService } from '../../external/services/lambda.service';
// dto
import { MissionQueryDto } from '../dto/missions.dto';
import { SkipstersQueryDto } from '../dto/skipsters.dto';
import { SkippyModidyDto } from '../dto/skippy.dto';
// schemas
import { Skip } from '../../database/schemas/skip.schema';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const monthValues = {
  January: 0,
  February: 0,
  March: 0,
  April: 0,
  May: 0,
  June: 0,
  July: 0,
  August: 0,
  September: 0,
  October: 0,
  November: 0,
  December: 0,
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
    @InjectModel(Skipster.name) private skipsterModel: Model<Skipster>,
    @InjectModel(Skip.name) private skipModel: Model<Skip>,
    private lambdaService: LambdaService,
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
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getMissions(skip: number): Promise<any> {
    try {
      const missions = await this.missionModel
        .find({})
        .select(
          '_id mission_name mock startTime endTime mission_completed skipster_id skip_id',
        )
        .limit(10)
        .skip(skip)
        .sort({ _id: 'desc' })
        .populate({
          path: 'skipster_id',
          select: 'nickname ',
        })
        .populate({
          path: 'skip_id',
          select: 'skippy_id order_info',
          populate: {
            path: 'skippy_id',
            select: 'name',
          },
        });

      const response = {
        data: missions,
      };

      return response;
    } catch (e) {
      throw new NotFoundException('getMissions - Could not find missions');
    }
  }

  async forceFinishMissions(body: MissionQueryDto): Promise<any> {
    try {
      const { mission_id } = body;
      //  call lambda function
      const lambdaPayload = {
        case: 'complete_mission',
        mission: {
          id: mission_id,
        },
      };
      this.lambdaService.invokeLambda(lambdaPayload);

      const finishedMission = await this.missionModel
        .findByIdAndUpdate(mission_id, {
          mission_completed: true,
        })
        .populate({
          path: 'skip_id',
          select: 'skippy_id order_info',
        });

      if (!finishedMission) {
        throw new NotFoundException('Could not find mission');
      }

      const previousMission = await this.missionModel.findOneAndUpdate(
        {
          previous_mission_id: finishedMission._id,
        },
        { previous_mission_completed: true },
      );

      if (previousMission === null) {
        const skippyFound = await this.skippyModel.findOneAndUpdate(
          {
            current_skip_id: finishedMission.skip_id._id,
          },
          {
            current_skip_id: null,
          },
        );
        if (!finishedMission.mock) {
          const skip = await this.skipModel.findById(finishedMission.skip_id);
          await this.dl.updateOrderStatus(
            skippyFound.email,
            skip.order_info.order_id,
            'DELIVERED',
          );
        }
      }

      return { message: 'mission finished' };
    } catch (e) {
      console.log('Error finishing the mission: ', e);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async deleteMission(mission_id: string): Promise<any> {
    try {
      const missionDeleted = await this.missionModel.findOneAndDelete({
        _id: mission_id,
        mission_completed: true,
      });

      if (!missionDeleted) {
        throw new NotFoundException('Mission has to be finished before.');
      }

      await this.skipsterModel.findByIdAndUpdate(missionDeleted.skipster_id, {
        $pull: { missions: missionDeleted._id },
      });

      return { message: 'mission deleted' };
    } catch (error) {
      console.log('ERROR DELETING MISSION ', error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  /* Getting missions log for generate reports1 */
  async getMissionsLog(): Promise<any> {
    try {
      const skippies = await this.skippyModel
        .find({})
        .select('_id name missions')
        .sort({ _id: 'desc' })
        .populate({
          path: 'missions',
          select: '_id mock mission_completed',
        });
      let realMissions = 0;
      let mockMissions = 0;
      const answerSkippies = skippies.map((skippy) => {
        realMissions = 0;
        mockMissions = 0;
        skippy.missions.forEach((mission) => {
          if ((mission as any).mission_completed) {
            if ((mission as any).mock === false) {
              realMissions += 1;
            } else {
              mockMissions += 1;
            }
          }
        });
        return {
          skippyName: skippy.name,
          realMissions: realMissions,
          mockMissions: mockMissions,
        };
      });
      const skipsters = await this.skipsterModel
        .find({})
        .select('_id nickname missions')
        .sort({ _id: 'desc' })
        .populate({
          path: 'missions',
          select: '_id mock mission_completed',
        });
      const answerSkipsters = skipsters.map((skipster) => {
        realMissions = 0;
        mockMissions = 0;
        skipster.missions.forEach((mission) => {
          if ((mission as any).mission_completed) {
            if ((mission as any).mock === false) {
              realMissions += 1;
            } else {
              mockMissions += 1;
            }
          }
        });
        return {
          skipsterName: skipster.nickname,
          realMissions: realMissions,
          mockMissions: mockMissions,
        };
      });
      const response = {
        data: [answerSkippies, answerSkipsters],
      };

      return response;
    } catch (e) {
      console.log('getMissionsLog ', e);
      throw new NotFoundException(
        'getMissionsLog - Could not get any missions',
      );
    }
  }

  /* Skipsters time sheet reports2 */
  async getSkipstersTimeSheet(query: SkipstersQueryDto): Promise<any> {
    try {
      let { initialDate, endingDate } = query;
      const currentday = new Date(Date.now());
      //WE NEED TO ADD 1 DAY TO THE ENDING DATE, BECAUSE IS NOT INCLUSIVE
      if (endingDate !== undefined) {
        endingDate = new Date(endingDate);
        endingDate.setDate(endingDate.getDate() + 1);
      }
      if (initialDate !== undefined) {
        initialDate = new Date(initialDate);
      }
      switch (true) {
        case initialDate === undefined && endingDate === undefined:
          initialDate = new Date(currentday.getFullYear(), 0, 1);
          endingDate = new Date(currentday.getFullYear(), 11, 31);
          break;
        case initialDate === undefined:
          initialDate = new Date(2021, 0, 1);
          break;
        case endingDate === undefined:
          endingDate = new Date(Date.now());
      }
      //DEFINE THE SKELETON OF THE EARNINGS
      let earnings = {};
      for (
        let i = initialDate.getFullYear();
        i <= endingDate.getFullYear();
        i++
      ) {
        earnings[i] = JSON.parse(JSON.stringify(monthValues));
        if (i === initialDate.getFullYear()) {
          for (let j = 0; j < initialDate.getMonth(); j++) {
            delete earnings[i][monthNames[j]];
          }
          if (i === endingDate.getFullYear()) {
            for (let j = endingDate.getMonth() + 1; j < 12; j++) {
              delete earnings[i][monthNames[j]];
            }
          }
        } else if (i === endingDate.getFullYear()) {
          for (let j = endingDate.getMonth() + 1; j < 12; j++) {
            delete earnings[i][monthNames[j]];
          }
        }
      }
      const skipsters = await this.skipsterModel
        .find({})
        .select('_id nickname missions')
        .sort({ _id: 'desc' })
        .populate({
          path: 'missions',
          select: 'driving_time mission_coins mock startTime',
          match: { startTime: { $gte: initialDate, $lte: endingDate } },
        });
      let coinsPayout = 0;
      let drivingMiliseconds = 0;
      let missionsAmount = 0;
      const answer = skipsters.map((skipster) => {
        //CLEAR ERANINGS BEFORE FILLING IT WITH NEW DATA
        for (const year in earnings) {
          for (const month in earnings[year]) {
            earnings[year][month] = 0;
          }
        }
        coinsPayout = 0;
        drivingMiliseconds = 0;
        missionsAmount = 0;

        skipster.missions.forEach((mission) => {
          //REMOVE THIS IF STATEMENT IF YOU WANT TO CONSIDER MOCK MISSIONS
          if ((mission as any).mock === false) {
            coinsPayout += (mission as any).mission_coins;
            drivingMiliseconds += (mission as any).driving_time;
            missionsAmount += 1;
            earnings[(mission as any).startTime.getFullYear()][
              monthNames[(mission as any).startTime.getMonth()]
            ] += (mission as any).mission_coins;
          }
        });
        return {
          nickname: skipster.nickname,
          id: skipster._id,
          drivingMiliseconds: drivingMiliseconds,
          missionsAmount: missionsAmount,
          coinsPayout: coinsPayout,
          earnings: JSON.parse(JSON.stringify(earnings)),
        };
      });
      const response = {
        data: answer,
      };
      earnings = {};
      return response;
    } catch (e) {
      throw new NotFoundException(
        "getSkipstersTimeSheet - Couldn't get skipsters time sheet",
      );
    }
  }

  async getSkipsterMissions(skipster: string): Promise<any> {
    try {
      const theSkipster = await this.skipsterModel
        .findById(new ObjectId(skipster))
        .select('_id missions');
      const answer = await this.missionModel
        .where({
          _id: { $in: theSkipster.missions },
        })
        .select(
          'mission_name mission_xp mission_coins mock startTime endTime mission_completed estimated_time start_address_name ending_address_name driving_time',
        )
        .sort({ endTime: 'desc' });
      return answer;
    } catch (e) {
      console.log(e);
      throw new NotFoundException(
        "getSkipsterMissions - Couldn't get skipster's missions",
      );
    }
  }

  async modidySkippy(skippyemail: string, body: SkippyModidyDto): Promise<any> {
    try {
      const skippy = await this.skippyModel
        .findOneAndUpdate({ email: skippyemail }, body)
        .select('name email current_skip ip_address');
      return skippy;
    } catch (error) {
      console.log('error modifying skippys information');
      throw new InternalServerErrorException(
        'Could not modify skippy information',
      );
    }
  }

  // async testingSantiago(): Promise<any> {
  //   try {
  //     const misiones = await this.missionModel
  //       .find({})
  //       .select('_id name mission_completed mock skipster_id')
  //       .sort({ _id: 'desc' });
  //     let resultado = 0;
  //     const respuesta = misiones.forEach((mission) => {
  //       if ((mission as any).skipster_id === '62b204e9dbce1ef4676a8c96') {
  //         resultado += 1;
  //       }
  //       return { resultado: resultado };
  //     });
  //     return resultado;
  //   } catch (e) {
  //     console.log(e);
  //     throw new NotFoundException(e);
  //   }
  // }
}
