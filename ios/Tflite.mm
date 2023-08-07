#import "Tflite.h"

@implementation Tflite
RCT_EXPORT_MODULE()

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
//- (NSNumber *)multiply:(double)a b:(double)b {
//    NSNumber *result = @(a * b);
//
//    return result;
//}

- (void)initTensor:(NSString *)modelPath count:(double)count resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
}

- (void)tensorBase64:(NSString *)imageString resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
}

- (void)tensorImage:(NSString *)imagePath resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeTfliteSpecJSI>(params);
}
#endif

@end
