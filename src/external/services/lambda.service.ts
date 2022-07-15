import { Injectable } from '@nestjs/common';
// aws
import AWS from 'aws-sdk';

@Injectable()
export class LambdaService {
  invokeLambda(payload: any) {
    AWS.config.region = 'us-east-1';
    const params = {
      FunctionName: 'ws-MA-missionHandler', // the lambda function we are going to invoke
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
      Payload: JSON.stringify(payload),
    };
    const lambdaFunction = new AWS.Lambda();

    lambdaFunction.invoke(params, function (err, data) {
      if (err) {
        // console.log(err);
      } else {
        // console.log(data);
      }
    });
  }
}
