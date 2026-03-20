const fs = require('fs');

const brokenFiles = [
  { path: 'd:/program/App Dev/RetireAssist/app/onboarding/profile-setup.tsx', badTag: '<style={styles.safe}>', goodTag: '<SafeAreaView style={styles.safe}>' },
  { path: 'd:/program/App Dev/RetireAssist/app/notifications.tsx', badTag: '<style={styles.safe}>', goodTag: '<SafeAreaView style={styles.safe}>' },
  { path: 'd:/program/App Dev/RetireAssist/app/index.tsx', badTag: '<style={styles.safe}>', goodTag: '<SafeAreaView style={styles.safe}>' },
  { path: 'd:/program/App Dev/RetireAssist/app/helper-profile.tsx', badTag: '<style={styles.safeArea}>', goodTag: '<SafeAreaView style={styles.safeArea}>' },
  { path: 'd:/program/App Dev/RetireAssist/app/documents.tsx', badTag: '<style={styles.safeArea}>', goodTag: '<SafeAreaView style={styles.safeArea}>' },
  { path: 'd:/program/App Dev/RetireAssist/app/auth/signup.tsx', badTag: '<style={styles.safe}>', goodTag: '<SafeAreaView style={styles.safe}>' },
  { path: 'd:/program/App Dev/RetireAssist/app/auth/role-select.tsx', badTag: '<style={styles.safe}>', goodTag: '<SafeAreaView style={styles.safe}>' },
  { path: 'd:/program/App Dev/RetireAssist/app/(tabs)/services.tsx', badTag: '<style={styles.safeArea}>', goodTag: '<SafeAreaView style={styles.safeArea}>' },
];

brokenFiles.forEach(({ path, badTag, goodTag }) => {
  let content = fs.readFileSync(path, 'utf8');

  // 1. Strip trailing garbage after last });
  const lastBrace = content.lastIndexOf('});');
  if (lastBrace !== -1) {
    content = content.substring(0, lastBrace + 3) + '\n';
  }

  // 2. Fix broken opening tag
  content = content.split(badTag).join(goodTag);

  // 3. Fix </> that should be </SafeAreaView>
  content = content.split('\n').map(line => {
    if (line.trim() === '</>') {
      return line.replace('</>', '</SafeAreaView>');
    }
    return line;
  }).join('\n');

  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed:', path);
});

console.log('\nAll remaining screens fixed!');
