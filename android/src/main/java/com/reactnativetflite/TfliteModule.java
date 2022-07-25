package com.reactnativetflite;

import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import org.tensorflow.lite.Interpreter;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;

@ReactModule(name = TfliteModule.NAME)
public class TfliteModule extends ReactContextBaseJavaModule {
  public static final String NAME = "Tflite";
  private Interpreter interpreter;

  public TfliteModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void initTensor(String modelFile, int count, Promise promise) {
    AssetManager assetManager = getReactApplicationContext().getAssets();
    try {
      Interpreter.Options options = new Interpreter.Options();
      options.setNumThreads(count);
      interpreter = new Interpreter(loadModelFile(assetManager, modelFile), options);
      interpreter.allocateTensors();
      promise.resolve("initialization tflite success");
    } catch (Exception e) {
      e.printStackTrace();
      promise.reject(new Throwable(e));
      return;
    }
  }

  @ReactMethod
  public void tensorImage(String imagePath, Promise promise) {
    promise.resolve(imagePath);
  }

  private static MappedByteBuffer loadModelFile(AssetManager assets, String modelFilename)
    throws IOException {
    AssetFileDescriptor fileDescriptor = assets.openFd(modelFilename);
    FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
    FileChannel fileChannel = inputStream.getChannel();
    long startOffset = fileDescriptor.getStartOffset();
    long declaredLength = fileDescriptor.getDeclaredLength();
    return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
  }

  class ObjTensor {

  }

}
