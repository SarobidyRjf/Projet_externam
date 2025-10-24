<script setup lang="ts">
definePageMeta({
  alias: "/sign-in-2",
  layout: false,
});
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start">
        <NuxtLink to="#" class="flex items-center gap-2 font-medium">
          <div
            class="flex overflow-hidden h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <NuxtImg src="/avatar.jpeg" />
          </div>
          Dashboard
        </NuxtLink>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <form class="flex flex-col gap-6">
            <div class="flex flex-col items-center gap-2 text-center">
              <h1 class="text-2xl font-bold">Login to your account</h1>
              <p class="text-balance text-sm text-muted-foreground">
                Enter your email below to login to your account
              </p>
            </div>
            <div class="grid gap-6">
              <div class="grid gap-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div class="grid gap-2">
                <div class="flex items-center">
                  <Label for="password">Password</Label>
                  <NuxtLink
                    to="#"
                    class="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </NuxtLink>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" class="w-full"> Sign in </Button>
              <div
                class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
              >
                <span
                  class="relative z-10 bg-background px-2 text-muted-foreground"
                >
                  Or continue with
                </span>
              </div>
              <div class="flex w-full gap-2">
                <div class="w-full">
                  <Button variant="outline" class="w-full">
                    <Icon name="tabler:brand-github" />
                    GitHub
                  </Button>
                </div>

                <div class="w-full">
                  <Button variant="outline" class="w-full">
                    <Icon name="tabler:brand-google" />
                    Google
                  </Button>
                </div>
              </div>
            </div>
            <div class="text-center text-sm">
              Don't have an account?
              <NuxtLink to="#" class="underline underline-offset-4">
                Sign up
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="relative hidden bg-muted lg:block">
      <NuxtImg
        src="/placeholder.svg"
        alt="Image"
        class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  </div>
</template>
