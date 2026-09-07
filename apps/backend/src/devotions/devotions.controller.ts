import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { DevotionsService } from "./devotions.service";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import {
  devotionBatchInputSchema,
  devotionInputSchema,
  devotionUpdateSchema,
  DevotionBatchInput,
  DevotionInput,
  DevotionUpdateInput,
} from "@devotion/shared";

@Controller("devotions")
export class DevotionsController {
  constructor(private readonly devotionsService: DevotionsService) {}

  @Post("upload-image")
  @UseInterceptors(FileInterceptor("image"))
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }
    return this.devotionsService.saveUploadedImage(file);
  }

  @Post()
  create(@Body(new ZodValidationPipe(devotionInputSchema)) body: DevotionInput) {
    return this.devotionsService.create(body);
  }

  @Post("batch")
  createBatch(@Body(new ZodValidationPipe(devotionBatchInputSchema)) body: DevotionBatchInput) {
    return this.devotionsService.createBatch(body);
  }

  @Get()
  findMany(@Query("from") from?: string, @Query("to") to?: string) {
    return this.devotionsService.findMany(from, to);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.devotionsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(devotionUpdateSchema)) body: DevotionUpdateInput,
  ) {
    return this.devotionsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.devotionsService.remove(id);
  }
}
