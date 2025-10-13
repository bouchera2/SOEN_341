declare module "qr-scanner" {
    export default class QrScanner {
      static scanImage(image: File | HTMLImageElement | string): Promise<string>;
    }
  }
  