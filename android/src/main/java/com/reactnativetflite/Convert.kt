package com.reactnativetflite

import android.graphics.*
import android.util.Base64
import androidx.camera.core.ImageProxy
import org.tensorflow.lite.support.common.ops.NormalizeOp
import org.tensorflow.lite.support.image.ImageProcessor
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.support.image.ops.ResizeOp
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer

class Convert {
  private val imageTensorProcessor: ImageProcessor = ImageProcessor.Builder()
    .add(ResizeOp(112, 112, ResizeOp.ResizeMethod.BILINEAR))
    .add(NormalizeOp(127.5f, 127.5f))
    .build()

  fun bitmap2ByteBuffer(bitmap: Bitmap?): ByteBuffer {
    val imageTensor: TensorImage = imageTensorProcessor.process(TensorImage.fromBitmap(bitmap))
    return imageTensor.buffer
  }

  fun imageProxy2ByteArray(image: ImageProxy): ByteArray? {
    try {
      val planes = image.planes
      val yBuffer = planes[0].buffer
      val uBuffer = planes[1].buffer
      val vBuffer = planes[2].buffer
      val ySize = yBuffer.remaining()
      val uSize = uBuffer.remaining()
      val vSize = vBuffer.remaining()
      val nv21 = ByteArray(ySize + uSize + vSize)
      //U and V are swapped
      yBuffer[nv21, 0, ySize]
      vBuffer[nv21, ySize, vSize]
      uBuffer[nv21, ySize + vSize, uSize]
      val yuvImage = YuvImage(nv21, ImageFormat.NV21, image.width, image.height, null)
      val out = ByteArrayOutputStream()
      yuvImage.compressToJpeg(Rect(0, 0, yuvImage.width, yuvImage.height), 75, out)
      return out.toByteArray()
    } catch (e: Exception) {
      e.printStackTrace()
      return null
    }
  }

  fun byteArray2Bitmap(imageBytes: ByteArray): Bitmap? {
    return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
  }

  private fun byteArray2ByteBuffer(imageBytes: ByteArray): ByteBuffer? {
    return ByteBuffer.wrap(imageBytes)
  }

  fun base642Bitmap(imageString: String): Bitmap? {
    val decodedString = Base64.decode(imageString, Base64.DEFAULT)
    return BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
  }
}
