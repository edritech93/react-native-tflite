//
//  TfliteModule.m
//  react-native-tflite
//
//  Created by Yudi Edri Alviska on 29/07/22.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TfliteModule, NSObject)

RCT_EXTERN_METHOD(initTensor:(NSString)modelName
                  withCount:(NSNumber)count
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(tensorImage:(NSString)imagePath
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
