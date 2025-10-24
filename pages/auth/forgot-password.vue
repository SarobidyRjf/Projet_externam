<script setup lang="ts">
definePageMeta({
  alias: "/forgot-password",
  layout: false,
});
</script>

<template>
  <div
    class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"
  >
    <Card class="w-full mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Forgot Password </CardTitle>
        <CardDescription>
          <div class="flex flex-col">
            <span>Enter your registered email and </span>
            <span> we will send you a link to reset your password. </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-6">
          <div class="grid gap-2">
            <Label html-for="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <Button type="submit" class="w-full"> Continue </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p class="text-sm">
          Don't have an account?
          <NuxtLink to="#" class="underline"> Sign up.</NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
