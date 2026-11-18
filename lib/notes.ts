// ==========================================
// 1. 型別
// ==========================================

// 之後改成 zod schema 推導（z.infer），並在這裡集中定義 queryOptions
export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};
