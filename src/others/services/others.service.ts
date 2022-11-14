import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// schemas
import { Restaurant } from 'src/database/schemas/restaurant.schema';
import { Logs } from 'src/database/schemas/logs.schema';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';

@Injectable()
export class OthersService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    @InjectModel(Logs.name) private logsModel: Model<Logs>,
  ) {}

  //Get all restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      return await this.restaurantModel.find().sort({ rid: 1 });
    } catch (error) {
      console.log('getRestaurants error: ', error);
      throw new InternalServerErrorException(
        'Could not get restaurants information',
      );
    }
  }

  //Add more restaurants
  async addRestaurants(restaurants: any): Promise<Restaurant[]> {
    try {
      return await this.restaurantModel.insertMany(restaurants);
    } catch (error) {
      console.log('addRestaurants error: ', error);
      throw new InternalServerErrorException('Could not add restaurants');
    }
  }

  //Update restaurant
  async updateRestaurant(restaurant: any): Promise<Restaurant> {
    try {
      return await this.restaurantModel.findOneAndUpdate(
        { rid: restaurant.rid },
        restaurant,
      );
    } catch (error) {
      console.log('updateRestaurant error: ', error);
      throw new InternalServerErrorException('Could not update restaurant');
    }
  }

  //Delete restaurant by rid
  async deleteRestaurant(rid: number): Promise<Restaurant> {
    try {
      return await this.restaurantModel.findOneAndDelete({ rid });
    } catch (error) {
      console.log('deleteRestaurant error: ', error);
      throw new InternalServerErrorException('Could not delete restaurant');
    }
  }

  async throwError(): Promise<void> {
    //try catch
    try {
      throw new Error('throw error');
    } catch (error) {
      // Sentry.captureException(error);
      throw new InternalServerErrorException('throw error');
    }
  }

  async throwErrorSentry(): Promise<void> {
    //try catch
    try {
      throw new Error('throw error');
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async skippyMetrics(body: any): Promise<any> {
    try {
      const timeStamp = new Date();
      const { date, type, ...newObj } = body;

      const newLogs = new this.logsModel({
        createdAt: timeStamp,
        date,
        type,
        body: newObj,
      });

      await newLogs.save();

      return { message: 'metric created', success: true };
    } catch (error) {
      console.log('++metrics error++', error);
      throw new InternalServerErrorException('Could not read skippy metrics');
    }
  }
}
