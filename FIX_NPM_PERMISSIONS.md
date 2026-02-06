# Fix: npm Permission Error (EACCES)

## The Problem

npm is getting permission denied errors when trying to write to the cache directory.

## Quick Fix

### Option 1: Clear npm cache (Recommended)

```bash
# Clear npm cache
npm cache clean --force

# Then try install again
npm install
```

### Option 2: Fix npm cache permissions

```bash
# Fix permissions on npm cache
sudo chown -R $(whoami) ~/.npm

# Then try install again
npm install
```

### Option 3: Use npm with --force flag

```bash
npm install --force
```

### Option 4: Use a different cache location

```bash
# Set npm cache to a location you own
npm config set cache ~/.npm-cache

# Then try install again
npm install
```

## If Still Having Issues

### Complete Clean Install

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# 3. Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm

# 4. Reinstall
npm install
```

## Alternative: Use Yarn

If npm continues to have issues, you can use Yarn instead:

```bash
# Install Yarn (if not installed)
npm install -g yarn

# Use Yarn instead of npm
yarn install
```

Then use `yarn` commands instead of `npm` commands.
