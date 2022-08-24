import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// schemas
import { Restaurant } from 'src/database/schemas/restaurant.schema';

@Injectable()
export class OthersService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
  ) {}

  //Get all restaurants
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      return await this.restaurantModel.find();
    } catch (error) {
      console.log('getRestaurants error: ', error);
      throw new InternalServerErrorException(
        'Could not get restaurants information',
      );
    }
  }

  //add more restaurants
  async addRestaurants(restaurants: any): Promise<Restaurant[]> {
    try {
      return await this.restaurantModel.insertMany(restaurants);
    } catch (error) {
      console.log('addRestaurants error: ', error);
      throw new InternalServerErrorException('Could not add restaurants');
    }
  }
}
