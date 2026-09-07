import { api } from "./client";
import { DevotionBatchInput, DevotionDto, DevotionInput, DevotionUpdateInput } from "@devotion/shared";

export const devotionsApi = {
  list: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return api.get<DevotionDto[]>(`/devotions${qs ? `?${qs}` : ""}`);
  },
  create: (input: DevotionInput) => api.post<DevotionDto>("/devotions", input),
  createBatch: (input: DevotionBatchInput) => api.post<DevotionDto[]>("/devotions/batch", input),
  update: (id: string, input: DevotionUpdateInput) => api.patch<DevotionDto>(`/devotions/${id}`, input),
  remove: (id: string) => api.delete<{ success: boolean }>(`/devotions/${id}`),
  uploadImage: (file: File) => api.upload<{ url: string }>("/devotions/upload-image", file, "image"),
};
