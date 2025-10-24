<template>
  <div class="flex h-screen w-full items-center justify-center px-4">
    <Card class="w-full mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Login </CardTitle>
        <CardDescription>
          Entrez votre email ci-dessous pour vous connecter à votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form @submit="onSubmit" class="space-y-6">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                v-model="email"
                :class="{ 'border-red-500': emailError }"
              />
              <span v-if="emailError" class="text-sm text-red-500">{{ emailError }}</span>
            </div>
            <div class="grid gap-2">
              <div class="flex items-center">
                <Label for="password">Mot de passe</Label>
                <NuxtLink to="#" class="ml-auto inline-block text-sm underline">
                  Mot de passe oublié ?
                </NuxtLink>
              </div>
              <Input id="password" type="password" required v-model="password" :class="{ 'border-red-500': passwordError }"/>
              <span v-if="passwordError" class="text-sm text-red-500">{{ passwordError }}</span>
            </div>
            <Button
              type="submit"
              class="w-full"
              :disabled="!meta.valid || isSubmitting"
              @click="onSubmit">
               {{ isSubmitting ? 'Connexion...' : 'Connexion' }}
              </Button>
            <Button variant="outline" class="w-full"> Se connecter avec Google </Button>
          </div>
        </Form>
        <!-- <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink to="#" class="underline"> Sign up </NuxtLink>
        </div> -->
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

definePageMeta({
  alias: "/sign-in-1",
  layout: false,
});

const { authentification } = useAuthStore();

//definissena ny schema
const validationSchema = toTypedSchema(
  z.object({
    email: z.string().min(1, { message: "Email requis" }).email({ message: "Format de l'email incorrect" }),
    password: z.string().min(5, { message: "Le mot de passe doit contenir au moins 5 caractères" }),
  })
)

//initialise le form
const { handleSubmit, meta, isSubmitting } = useForm({
  validationSchema,
});

//define the field
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: password, errorMessage: passwordError } = useField<string>('password');

// Handle form submission
const onSubmit = handleSubmit( async(values: { email: string; password: string }) => {
  await authentification(values.email, values.password);
});

</script>
