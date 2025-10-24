<template>
  <Drawer :direction="direction" v-model:open="open">
    <DrawerContent class="min-w-4xl">
      <DrawerHeader>
        <DrawerTitle class="text-center text-2xl">{{ title }}</DrawerTitle>
      </DrawerHeader>
      <DrawerDescription class="overflow-y-scroll min-h-[40%]">
        <div class="space-y-4 p-4 ">
            <slot />
        </div>
      </DrawerDescription>

      <DrawerFooter>
        <DrawerClose>
          <Button variant="outline">Retour</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const props = defineProps<{
  open: boolean
  title?: string
  description?: string
  direction?: 'left' | 'right' | 'top' | 'bottom'
}>()

const emit = defineEmits(['update:open'])

const open = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})
</script>
