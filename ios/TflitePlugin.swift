//
//  TflitePlugin.swift
//  react-native-tflite
//
//  Created by Yudi Edri Alviska on 29/07/22.
//

import Foundation
import UIKit
import TensorFlowLite
import Accelerate
import AVKit
import Vision

@objc(TflitePlugin)
public class TflitePlugin: NSObject, FrameProcessorPluginBase {
    @objc
    public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
        guard let image: UIImage = SampleBuffer2UIImage(from: frame.buffer) else {
            print("Failed to get image")
            return nil
        }
        guard let pixelBuffer = uiImageToPixelBuffer(image: image, size: inputWidth) else {
            print("Failed to get pixelBuffer")
            return nil
        }
        do {
            let inputTensor = try interpreter?.input(at: 0)
            // Remove the alpha component from the image buffer to get the RGB data.
            guard let rgbData = rgbDataFromBuffer(
                pixelBuffer,
                byteCount: batchSize * inputWidth * inputHeight * inputChannels,
                isModelQuantized: inputTensor?.dataType == .uInt8
            ) else {
                print("Failed to convert the image buffer to RGB data.")
                return nil
            }
            // Copy the RGB data to the input `Tensor`.
            try interpreter?.copy(rgbData, toInputAt: 0)
            // Run inference by invoking the `Interpreter`.
            try interpreter?.invoke()
            // Get the output `Tensor` to process the inference results.
            let outputTensor: Tensor? = try interpreter?.output(at: 0)
            if ((outputTensor?.data) != nil) {
                let result: [Float] = [Float32](unsafeData: outputTensor!.data) ?? []
                return result
            } else {
                return []
            }
        } catch let error {
            return error.localizedDescription
        }
    }
}
