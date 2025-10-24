<script setup lang="ts">
import {
  PinInput,
  PinInputGroup,
  PinInputSlot,
} from "@/components/ui/pin-input";

definePageMeta({
  alias: "/otp",
  layout: false,
});

const value = ref<string[]>([]);
const handleComplete = (e: string[]) => alert(e.join(""));
</script>

<template>
  <div
    class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"
  >
    <Card class="w-full mx-auto max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl"> Two-factor Authentication </CardTitle>
        <CardDescription>
          <div class="flex flex-col">
            <span>Please enter the authentication code. </span>
            <span> We have sent the authentication code to your email. </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PinInput
          id="pin-input"
          v-model="value"
          placeholder=""
          @complete="handleComplete"
        >
          <PinInputGroup class="gap-4 w-full flex justify-center">
            <template v-for="(id, index) in 4" :key="id">
              <PinInputSlot class="rounded-lg border size-14" :index="index" />
            </template>
          </PinInputGroup>
        </PinInput>
        <Button class="w-full mt-5">Verify</Button>
      </CardContent>
      <CardFooter>
        <p class="text-sm text-center w-full">
          Haven't received it?
          <NuxtLink to="#" class="underline"> Resend a new code.</NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
