import { Body, Controller, Get, Header, Put } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OthersService } from '../services/others.service';
//dtos
import { RestaurantDto } from '../dtos/restaurants.dto';

@ApiTags('Others')
@Controller('others')
export class OthersController {
  constructor(private othersService: OthersService) {}

  @ApiOperation({ summary: `Get all restaurants` })
  @Get('restaurants')
  @Header('Access-Control-Allow-Origin', '*')
  getRestaurants() {
    return this.othersService.getRestaurants();
  }

  @ApiOperation({ summary: `Add more restaurants` })
  @Put('restaurants')
  @Header('Access-Control-Allow-Origin', '*')
  addRestaurants(@Body() body: RestaurantDto) {
    return this.othersService.addRestaurants(body);
  }
}
