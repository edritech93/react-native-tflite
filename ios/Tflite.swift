import UIKit
import TensorFlowLite
import Accelerate

@objc(Tflite)
class Tflite: NSObject {
    
    /// The current thread count used by the TensorFlow Lite Interpreter.
    let threadCount: Int = 0
    
    // MARK: - Model Parameters
    let batchSize = 1
    let inputChannels = 3
    let inputWidth = 112
    let inputHeight = 112
    
    // MARK: - Private Properties
    /// List of labels from the given labels file.
    var labels: [String] = []
    
    /// TensorFlow Lite `Interpreter` object for performing inference on a given model.
    var interpreter: Interpreter
    
    @objc(initTensor:withModelLabel:withCount:withResolver:withRejecter:)
    func initTensor(modelName: String, modelLabel: String, count: Int = 1, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> String? {
        // Construct the path to the model file.
        guard let modelPath = Bundle.main.path(
            forResource: modelName,
            ofType: "tflite"
        ) else {
            print("Failed to load the model file with name: \(modelName).")
            return nil
        }
        // Specify the options for the `Interpreter`.
        var options = Interpreter.Options()
        options.threadCount = threadCount
        do {
            // Create the `Interpreter`.
            interpreter = try Interpreter(modelPath: modelPath, options: options)
            // Allocate memory for the model's input `Tensor`s.
            try interpreter.allocateTensors()
        } catch let error {
            print("Failed to create the interpreter with error: \(error.localizedDescription)")
            return nil
        }
        // Load the classes listed in the labels file.
        guard let fileURL = Bundle.main.url(forResource: modelLabel, withExtension: "txt") else {
            fatalError("Labels file not found in bundle. Please add a labels file with name " +
                       "\(modelLabel).txt and try again.")
        }
        do {
            let contents = try String(contentsOf: fileURL, encoding: .utf8)
            labels = contents.components(separatedBy: .newlines)
        } catch {
            fatalError("Labels file named \(modelLabel).txt cannot be read. Please add a " +
                       "valid labels file and try again.")
        }
    }
    
    @objc(tensorImage:withResolver:withRejecter:)
    func tensorImage(imagePath: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> String? {
        let pixelBuffer = uiImageToPixelBuffer(image: UIImage.init(contentsOfFile: imagePath)!, size: inputWidth)
        do {
            let inputTensor = try interpreter.input(at: 0)
            // Remove the alpha component from the image buffer to get the RGB data.
            guard let rgbData = rgbDataFromBuffer(
                pixelBuffer!,
                byteCount: batchSize * inputWidth * inputHeight * inputChannels,
                isModelQuantized: inputTensor.dataType == .uInt8
            ) else {
                reject("Failed to convert the image buffer to RGB data.", nil, nil)
                return nil
            }
            // Copy the RGB data to the input `Tensor`.
            try interpreter.copy(rgbData, toInputAt: 0)
            
            // Run inference by invoking the `Interpreter`.
            try interpreter.invoke()
            // Get the output `Tensor` to process the inference results.
            let outputTensor: Tensor = try interpreter.output(at: 0)
            resolve(outputTensor)
            return nil
        } catch let error {
            reject("Failed to invoke the interpreter with error: \(error.localizedDescription)", nil, nil)
            return nil
        }
        
    }
    
    private func rgbDataFromBuffer(
        _ buffer: CVPixelBuffer,
        byteCount: Int,
        isModelQuantized: Bool
    ) -> Data? {
        CVPixelBufferLockBaseAddress(buffer, .readOnly)
        defer {
            CVPixelBufferUnlockBaseAddress(buffer, .readOnly)
        }
        guard let sourceData = CVPixelBufferGetBaseAddress(buffer) else {
            return nil
        }
        
        let width = CVPixelBufferGetWidth(buffer)
        let height = CVPixelBufferGetHeight(buffer)
        let sourceBytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
        let destinationChannelCount = 3
        let destinationBytesPerRow = destinationChannelCount * width
        
        var sourceBuffer = vImage_Buffer(data: sourceData,
                                         height: vImagePixelCount(height),
                                         width: vImagePixelCount(width),
                                         rowBytes: sourceBytesPerRow)
        
        guard let destinationData = malloc(height * destinationBytesPerRow) else {
            print("Error: out of memory")
            return nil
        }
        
        defer {
            free(destinationData)
        }
        
        var destinationBuffer = vImage_Buffer(data: destinationData,
                                              height: vImagePixelCount(height),
                                              width: vImagePixelCount(width),
                                              rowBytes: destinationBytesPerRow)
        
        let pixelBufferFormat = CVPixelBufferGetPixelFormatType(buffer)
        
        switch (pixelBufferFormat) {
        case kCVPixelFormatType_32BGRA:
            vImageConvert_BGRA8888toRGB888(&sourceBuffer, &destinationBuffer, UInt32(kvImageNoFlags))
        case kCVPixelFormatType_32ARGB:
            vImageConvert_ARGB8888toRGB888(&sourceBuffer, &destinationBuffer, UInt32(kvImageNoFlags))
        case kCVPixelFormatType_32RGBA:
            vImageConvert_RGBA8888toRGB888(&sourceBuffer, &destinationBuffer, UInt32(kvImageNoFlags))
        default:
            // Unknown pixel format.
            return nil
        }
        
        let byteData = Data(bytes: destinationBuffer.data, count: destinationBuffer.rowBytes * height)
        if isModelQuantized {
            return byteData
        }
        
        // Not quantized, convert to floats
        let bytes = Array<UInt8>(unsafeData: byteData)!
        var floats = [Float]()
        for i in 0..<bytes.count {
            floats.append(Float(bytes[i]) / 255.0)
        }
        return Data(copyingBufferOf: floats)
    }
}

// MARK: - Extensions

extension Data {
    /// Creates a new buffer by copying the buffer pointer of the given array.
    init<T>(copyingBufferOf array: [T]) {
        self = array.withUnsafeBufferPointer(Data.init)
    }
}

extension Array {
    /// Creates a new array from the bytes of the given unsafe data.
    init?(unsafeData: Data) {
        guard unsafeData.count % MemoryLayout<Element>.stride == 0 else { return nil }
#if swift(>=5.0)
        self = unsafeData.withUnsafeBytes { .init($0.bindMemory(to: Element.self)) }
#else
        self = unsafeData.withUnsafeBytes {
            .init(UnsafeBufferPointer<Element>(
                start: $0,
                count: unsafeData.count / MemoryLayout<Element>.stride
            ))
        }
#endif  // swift(>=5.0)
    }
}
