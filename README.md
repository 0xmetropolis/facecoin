# Facecoin Internal Development Setup

This guide is for `metal` developers setting up the Facecoin development environment.

## Production

- [Vercel](https://vercel.com/0xmetropolis/facecoin)
- [Figma](https://www.figma.com/design/wDWg1J43kq72CYVljeJE39/Facecoin?node-id=0-1&p=f&t=gxgnaka8EZ5RIl9Z-0)
- [Linear Project](https://linear.app/metropolis/project/facecoin-46ac8a25e8c6/overview)
- Production site: [facecoin.metal.build](https://facecoin.metal.build)

## Prerequisites

- Vercel CLI (`pnpm i -g vercel`)

## Initial Setup

1. Clone the repository:

   ```bash
   git clone git@github.com:0xmetropolis/facecoin.git
   cd facecoin
   ```

2. Install dependencies:

   ```bash
   pnpm i
   ```

3. Link to Vercel project:

   ```bash
   vercel link
   ```

4. Pull environment variables:

   ```bash
   vercel env pull
   ```

## Development

Start the development server:

- Using VSCode: Press F5 to start with debugger
- Using CLI: `pnpm run dev`

The app will be available at `http://localhost:3000`
