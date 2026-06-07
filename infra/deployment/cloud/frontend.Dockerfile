FROM node:20-alpine AS build

WORKDIR /app

ARG REACT_APP_API_BASE_URL
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_PUBLISHABLE_KEY

ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_PUBLISHABLE_KEY=$REACT_APP_SUPABASE_PUBLISHABLE_KEY

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

COPY apps/web ./
RUN npm run build

FROM nginx:1.27-alpine

COPY infra/deployment/cloud/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
