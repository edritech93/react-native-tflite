package com.reactnativetflite

import android.graphics.Bitmap
import org.tensorflow.lite.support.common.ops.NormalizeOp
import org.tensorflow.lite.support.image.ImageProcessor
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.support.image.ops.ResizeOp
import java.nio.ByteBuffer

class Convert {
  private val imageTensorProcessor: ImageProcessor = ImageProcessor.Builder()
    .add(ResizeOp(112, 112, ResizeOp.ResizeMethod.BILINEAR))
    .add(NormalizeOp(127.5f, 127.5f))
    .build()

  fun convertBitmapToBuffer(bitmap: Bitmap?): ByteBuffer {
    val imageTensor: TensorImage = imageTensorProcessor.process(TensorImage.fromBitmap(bitmap))
    return imageTensor.buffer
  }
}
