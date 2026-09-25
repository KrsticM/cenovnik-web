-- RLS policies for authenticated user access to shopping lists
-- Allows users to read/write/delete their own lists and items

-- Enable RLS on tables (should already be enabled, but ensure it)
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Policy for shopping_lists: authenticated users can select their own lists
CREATE POLICY "Users can select their own shopping lists"
  ON public.shopping_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for shopping_lists: authenticated users can insert their own lists
CREATE POLICY "Users can create shopping lists"
  ON public.shopping_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for shopping_lists: authenticated users can update their own lists
CREATE POLICY "Users can update their own shopping lists"
  ON public.shopping_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for shopping_lists: authenticated users can delete their own lists
CREATE POLICY "Users can delete their own shopping lists"
  ON public.shopping_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy for shopping_list_items: authenticated users can select items from their lists
CREATE POLICY "Users can select items from their shopping lists"
  ON public.shopping_list_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = shopping_list_items.shopping_list_id
      AND user_id = auth.uid()
    )
  );

-- Policy for shopping_list_items: authenticated users can insert items to their lists
CREATE POLICY "Users can add items to their shopping lists"
  ON public.shopping_list_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = shopping_list_id
      AND user_id = auth.uid()
    )
  );

-- Policy for shopping_list_items: authenticated users can update items in their lists
CREATE POLICY "Users can update items in their shopping lists"
  ON public.shopping_list_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = shopping_list_items.shopping_list_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = shopping_list_id
      AND user_id = auth.uid()
    )
  );

-- Policy for shopping_list_items: authenticated users can delete items from their lists
CREATE POLICY "Users can delete items from their shopping lists"
  ON public.shopping_list_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists
      WHERE id = shopping_list_items.shopping_list_id
      AND user_id = auth.uid()
    )
  );

-- Add unique constraint on (shopping_list_id, product_id) to prevent duplicates
-- Note: Check for existing duplicates first before applying this
ALTER TABLE public.shopping_list_items
ADD CONSTRAINT shopping_list_items_unique_product
  UNIQUE (shopping_list_id, product_id);
