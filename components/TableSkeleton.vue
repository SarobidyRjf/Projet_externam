<template>
  <div class="w-full">
    <div class="rounded-md border">
      <!-- En-têtes du tableau -->
      <div class="border-b bg-muted/50 px-4 py-3">
        <div class="flex items-center space-x-6">
          <Skeleton class="h-4 w-[20%]" />
          <Skeleton class="h-4 w-[20%]" />
          <Skeleton class="h-4 w-[20%]" />
          <Skeleton class="h-4 w-[20%]" />
          <Skeleton class="h-4 w-[20%]" />
        </div>
      </div>
      
      <!-- Corps du tableau -->
      <div class="divide-y">
        <div v-for="n in 10" :key="n" class="px-4 py-5">
          <div class="flex items-center space-x-6">
            <!-- Colonne 1 - Courte -->
            <Skeleton class="h-4 w-[20%]" />
            
            <!-- Colonne 2 - Longue avec variation -->
            <Skeleton 
              class="h-4" 
              :class="getRandomWidth(['w-[20%]', 'w-[20%]', 'w-[20%]', 'w-[20%]'])" 
            />
            
            <!-- Colonne 3 - Moyenne -->
            <Skeleton 
              class="h-4" 
              :class="getRandomWidth(['w-[20%]', 'w-[20%]', 'w-[20%]', 'w-[20%]'])" 
            />
            
            <!-- Colonne 4 - Variable -->
            <Skeleton 
              class="h-4" 
              :class="getRandomWidth(['w-[20%]', 'w-[20%]', 'w-[20%]', 'w-[20%]'])" 
            />

            <Skeleton 
              class="h-4" 
              :class="getRandomWidth(['w-[20%]', 'w-[20%]', 'w-[20%]', 'w-[20%]'])" 
            />
            
            <!-- Colonne 5 - Actions (boutons) -->
            <!-- <div class="flex items-center gap-7">
              <Skeleton class="h-8 w-8 rounded" />
              <Skeleton class="h-8 w-8 rounded" />
              <Skeleton class="h-8 w-8 rounded" />
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props optionnelles pour personnaliser le skeleton
const props = defineProps({
  rows: {
    type: Number,
    default: 10
  },
  showHeader: {
    type: Boolean,
    default: true
  }
})

// Fonction pour obtenir une largeur aléatoire parmi un tableau d'options
const getRandomWidth = (widths) => {
  const index = Math.floor(Math.random() * widths.length)
  return widths[index]
}
</script>