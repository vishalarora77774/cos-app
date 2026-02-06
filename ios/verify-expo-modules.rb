#!/usr/bin/env ruby
# Verify Expo modules are properly configured

require 'json'

puts "🔍 Checking Expo modules configuration..."

# Check Podfile.lock
if File.exist?('Podfile.lock')
  podfile_lock = File.read('Podfile.lock')
  if podfile_lock.include?('ExpoImagePicker')
    puts "✅ ExpoImagePicker found in Podfile.lock"
  else
    puts "❌ ExpoImagePicker NOT in Podfile.lock"
  end
else
  puts "❌ Podfile.lock not found - run 'pod install'"
end

# Check if module source exists
if Dir.exist?('../node_modules/expo-image-picker/ios')
  puts "✅ expo-image-picker source exists in node_modules"
else
  puts "❌ expo-image-picker source NOT in node_modules"
end

# Check target support files
if Dir.exist?('Pods/Target Support Files/ExpoImagePicker')
  puts "✅ ExpoImagePicker target support files exist"
else
  puts "❌ ExpoImagePicker target support files NOT found"
end

# Check headers
if Dir.exist?('Pods/Headers/Public/ExpoImagePicker')
  puts "✅ ExpoImagePicker headers exist"
else
  puts "❌ ExpoImagePicker headers NOT found"
end

puts "\n📋 Summary:"
puts "If all checks pass, the module should be available."
puts "If module still not found at runtime, the app needs to be rebuilt."
