//
//  TfliteModule.swift
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

@objc(TfliteModule)
class TfliteModule: NSObject {
    
    @objc(initTensor:withCount:withResolver:withRejecter:)
    func initTensor(modelName: String, count: Int = 1, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        // Construct the path to the model file.
        guard let modelPath = Bundle.main.path(
            forResource: modelName,
            ofType: "tflite"
        ) else {
            print("Failed to load the model file with name: \(modelName).")
            return
        }
        do {
            var options = Interpreter.Options()
            options.threadCount = count
            interpreter = try Interpreter(modelPath: modelPath, options: options)
            try interpreter?.allocateTensors()
            resolve("initialization tflite success")
        } catch let error {
            print("Failed to create the interpreter with error: \(error.localizedDescription)")
            reject("Error", "tflite error", error)
            return
        }
    }
    
    @objc(tensorImage:withResolver:withRejecter:)
    func tensorImage(imagePath: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let pixelBuffer = uiImageToPixelBuffer(image: UIImage.init(contentsOfFile: imagePath)!, size: inputWidth)
        do {
            let inputTensor = try interpreter?.input(at: 0)
            // Remove the alpha component from the image buffer to get the RGB data.
            guard let rgbData = rgbDataFromBuffer(
                pixelBuffer!,
                byteCount: batchSize * inputWidth * inputHeight * inputChannels,
                isModelQuantized: inputTensor?.dataType == .uInt8
            ) else {
                reject("Failed to convert the image buffer to RGB data.", nil, nil)
                return
            }
            // Copy the RGB data to the input `Tensor`.
            try interpreter?.copy(rgbData, toInputAt: 0)
            // Run inference by invoking the `Interpreter`.
            try interpreter?.invoke()
            // Get the output `Tensor` to process the inference results.
            let outputTensor: Tensor? = try interpreter?.output(at: 0)
            if ((outputTensor?.data) != nil) {
                let result: [Float] = [Float32](unsafeData: outputTensor!.data) ?? []
                resolve(result)
            } else {
                resolve([])
            }
        } catch let error {
            reject("Failed to invoke the interpreter with error: \(error.localizedDescription)", nil, nil)
        }
    }
    
    @objc(tensorBase64:withResolver:withRejecter:)
    func tensorBase64(imageString: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let stringData = Data(base64Encoded: imageString)
        guard let image = UIImage(data: stringData!) else {
            reject("Failed to get pixelBuffer", nil, nil)
            return
        }
        guard let pixelBuffer = uiImageToPixelBuffer(image: image, size: inputWidth) else {
            reject("Failed to get pixelBuffer", nil, nil)
            return
        }
        do {
            let inputTensor = try interpreter?.input(at: 0)
            // Remove the alpha component from the image buffer to get the RGB data.
            guard let rgbData = rgbDataFromBuffer(
                pixelBuffer,
                byteCount: batchSize * inputWidth * inputHeight * inputChannels,
                isModelQuantized: inputTensor?.dataType == .uInt8
            ) else {
                reject("Failed to convert the image buffer to RGB data.", nil, nil)
                return
            }
            // Copy the RGB data to the input `Tensor`.
            try interpreter?.copy(rgbData, toInputAt: 0)
            // Run inference by invoking the `Interpreter`.
            try interpreter?.invoke()
            // Get the output `Tensor` to process the inference results.
            let outputTensor: Tensor? = try interpreter?.output(at: 0)
            if ((outputTensor?.data) != nil) {
                let result: [Float] = [Float32](unsafeData: outputTensor!.data) ?? []
                resolve(result)
            } else {
                resolve([])
            }
        } catch let error {
            reject("Failed to invoke the interpreter with error: \(error.localizedDescription)", nil, nil)
        }
    }
}
