<script setup lang="ts">
definePageMeta({
  alias: "/sign-in-1",
  layout: false,
});
</script>

<template>
  <div class="flex h-screen w-full items-center justify-center px-4">
    <Card class="w-full mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Login </CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
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
              <NuxtLink to="#" class="ml-auto inline-block text-sm underline">
                Forgot your password?
              </NuxtLink>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" class="w-full"> Login </Button>
          <Button variant="outline" class="w-full"> Login with Google </Button>
        </div>
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink to="#" class="underline"> Sign up </NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
