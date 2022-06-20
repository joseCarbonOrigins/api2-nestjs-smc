import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// dtos
import {
  SkippysQuery,
  SkippyUpdate,
  MissionsQuery,
  MissionCreate,
  SkipCreate,
  SkipsterQuery,
  SkipsterCreate,
  MissionUpdate,
} from '../dtos/data.dto';
// schemas
import { Skipster } from '../../database/schemas/skipster.schema';
import { Skip } from '../../database/schemas/skip.schema';
import { Mission } from '../../database/schemas/mission.schema';
import { Skippy } from '../../database/schemas/skippy.schema';

@Injectable()
export class OriginsDaoService {
  constructor(
    @InjectModel(Skipster.name) private skipsterModel: Model<Skipster>,
    @InjectModel(Skip.name) private skipModel: Model<Skip>,
    @InjectModel(Mission.name) private missionModel: Model<Mission>,
    @InjectModel(Skippy.name) private skippyModel: Model<Skippy>,
  ) {}

  async getMissions(data: MissionsQuery): Promise<any> {
    const missions = await this.missionModel
      .find(data)
      .select(
        '_id mission_name mission_xp mission_coins estimated_time start_point ending_point start_address_name ending_address_name mock',
      )
      .populate({
        path: 'skip_id',
        select: 'skippy_id -_id',
        populate: {
          path: 'skippy_id',
          select: 'name email -_id',
        },
      });
    return missions;
  }

  async getMissionById(missionId: string): Promise<any> {
    const mission = await this.missionModel
      .findById(missionId)
      .select(
        '_id mission_name mission_xp mission_coins estimated_time start_point ending_point start_address_name ending_address_name',
      )
      .populate({
        path: 'skip_id',
        select: 'skippy_id -_id',
        populate: {
          path: 'skippy_id',
          select: 'name email -_id',
        },
      });
    return mission;
  }

  async createMission(data: MissionCreate): Promise<any> {
    const newMission = new this.missionModel(data);
    await newMission.save();
    return newMission;
  }

  async updateMissionById(
    missionId: string,
    data: MissionUpdate,
  ): Promise<any> {
    const missionUpdated = await this.missionModel.findByIdAndUpdate(
      missionId,
      data,
    );
    return missionUpdated;
  }

  async updateMission(
    findParams: MissionsQuery,
    data: MissionUpdate,
  ): Promise<any> {
    const mission = await this.missionModel.findOneAndUpdate(findParams, data);
    return mission;
  }

  async getSkippys(data: SkippysQuery): Promise<any> {
    const skippys = await this.skippyModel.find(data);
    return skippys;
  }

  async updateSkippyById(skippyId: string, data: SkippyUpdate): Promise<any> {
    const skippyUpdated = await this.skippyModel.findByIdAndUpdate(
      skippyId,
      data,
    );
    return skippyUpdated;
  }

  async updateSkippy(
    findParam: SkippysQuery,
    data: SkippyUpdate,
  ): Promise<any> {
    const skippy = await this.skippyModel.updateOne(findParam, data);
    return skippy;
  }

  async getSkipById(skipId: string): Promise<any> {
    const skip = await this.skipModel.findById(skipId);
    return skip;
  }

  async createSkip(data: SkipCreate): Promise<any> {
    const newSkip = new this.skipModel(data);
    await newSkip.save();
    return newSkip;
  }

  async updateSkipById(skipId: string, data): Promise<any> {
    const skipUpdated = await this.skipModel.findByIdAndUpdate(skipId, data);
    return skipUpdated;
  }

  async getSkipster(data: SkipsterQuery): Promise<any> {
    const skipster = await this.skipsterModel.findOne(data);
    return skipster;
  }

  async createSkipster(data: SkipsterCreate): Promise<any> {
    const newSkipster = new this.skipsterModel(data);
    await newSkipster.save();
    return newSkipster;
  }
}
