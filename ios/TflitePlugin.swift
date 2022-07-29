//
//  TflitePlugin.swift
//  react-native-tflite
//
//  Created by Yudi Edri Alviska on 29/07/22.
//

import AVKit
import Vision

@objc(TflitePlugin)
public class TflitePlugin: NSObject, FrameProcessorPluginBase {
    @objc
    public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
//        return "123qwe"
//        guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
//            return nil
//        }
//        NSLog("ExamplePlugin: \(CVPixelBufferGetWidth(imageBuffer)) x \(CVPixelBufferGetHeight(imageBuffer)) Image. Logging \(args.count) parameters:")
//
//        args.forEach { arg in
//            var string = "\(arg)"
//            if let array = arg as? NSArray {
//                string = (array as Array).description
//            } else if let map = arg as? NSDictionary {
//                string = (map as Dictionary).description
//            }
//            NSLog("ExamplePlugin:   -> \(string) (\(type(of: arg)))")
//        }
//
//        return [
//            "example_str": "Test",
//            "example_bool": true,
//            "example_double": 5.3,
//            "example_array": [
//                "Hello",
//                true,
//                17.38,
//            ],
//        ]
        
          guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
                 return nil
             }
        return nil
    }
}
