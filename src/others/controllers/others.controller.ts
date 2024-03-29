import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OthersService } from '../services/others.service';

//dtos
import { RestaurantDto } from '../dtos/restaurants.dto';
import { SentryInterceptor } from '../../interceptors/sentry.interceptor';

@UseInterceptors(SentryInterceptor)
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

  @ApiOperation({ summary: `Update restaurant` })
  @Patch('restaurant')
  @Header('Access-Control-Allow-Origin', '*')
  updateRestaurant(@Body() body: RestaurantDto) {
    return this.othersService.updateRestaurant(body);
  }

  @ApiOperation({ summary: `Delete restaurant` })
  @Delete('restaurant/:rid')
  @Header('Access-Control-Allow-Origin', '*')
  deleteRestaurant(@Param('rid') rid: number) {
    return this.othersService.deleteRestaurant(rid);
  }

  //throw error
  @ApiOperation({ summary: `Throw error` })
  @Get('error')
  @Header('Access-Control-Allow-Origin', '*')
  throwError() {
    return this.othersService.throwError();
  }

  @ApiOperation({ summary: `Throw error Sentry` })
  @Get('errorSentry')
  @Header('Access-Control-Allow-Origin', '*')
  throwErrorSentry() {
    return this.othersService.throwErrorSentry();
  }

  @ApiOperation({ summary: 'Skippy metrics' })
  @Post('skippy/metrics')
  @Header('Access-Control-Allow-Origin', '*')
  skippyMetrics(@Body() body: any) {
    return this.othersService.skippyMetrics(body);
  }
}
