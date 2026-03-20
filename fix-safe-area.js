const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('d:/program/App Dev/RetireAssist/app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if the file imports SafeAreaView from react-native
    if (content.includes('SafeAreaView') && /import.*SafeAreaView.*from.*react-native/.test(content)) {
        // Remove SafeAreaView from the import
        content = content.replace(/,\s*SafeAreaView/g, '');
        content = content.replace(/SafeAreaView\s*,\s*/g, '');
        content = content.replace(/SafeAreaView\s*/g, '');
        
        // Cleanup empty imports if they occur
        content = content.replace(/import\s*{\s*}\s*from\s*['"]react-native['"];?\n?/g, '');
        
        // Prepend the right import
        if (!content.includes('react-native-safe-area-context')) {
            content = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + content;
        }
        
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
