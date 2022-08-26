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

  //Delete restaurant
  async deleteRestaurant(restaurant: any): Promise<Restaurant> {
    try {
      return await this.restaurantModel.findOneAndDelete({
        rid: restaurant.rid,
      });
    } catch (error) {
      console.log('deleteRestaurant error: ', error);
      throw new InternalServerErrorException('Could not delete restaurant');
    }
  }
}
