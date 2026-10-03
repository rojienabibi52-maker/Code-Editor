import { Project, FileItem } from '../types/project';
import { NLCodePlan, NLCodeChange } from '../types/editor';

export const NLCoderService = {
  planChanges(prompt: string, project: Project): NLCodePlan {
    const q = prompt.toLowerCase();
    const pkg = project.packageName || 'com.codingide.app';
    const isAndroid = project.type === 'android';
    const changes: NLCodeChange[] = [];

    // Case 1: Login Screen / Auth UI
    if (q.includes('login') || q.includes('auth') || q.includes('sign in')) {
      const loginCode = `package ${pkg}

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit = {}) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome Back",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it; errorMessage = null },
            label = { Text("Email Address") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it; errorMessage = null },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(18.dp))

        if (errorMessage != null) {
            Text(
                text = errorMessage ?: "",
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        Button(
            onClick = {
                if (email.isBlank() || password.isBlank()) {
                    errorMessage = "Please fill in all fields"
                } else {
                    onLoginSuccess()
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Sign In")
        }
    }
}
`;
      changes.push({
        type: 'create',
        path: isAndroid ? 'app/src/main/kotlin/com/codingide/app/LoginScreen.kt' : 'src/LoginScreen.tsx',
        description: 'Create LoginScreen with email, password fields, validation state, and sign in button',
        newContent: loginCode,
      });

      return {
        userPrompt: prompt,
        summary: 'Propose Login Screen with Reactive State Validation',
        changes,
      };
    }

    // Case 2: Counter State / Button
    if (q.includes('counter') || q.includes('button') || q.includes('state')) {
      const counterSnippet = `package ${pkg}

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CounterComponent() {
    var count by remember { mutableStateOf(0) }

    Card(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Interactive State Count: $count", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { count++ }) { Text("Increment +") }
                OutlinedButton(onClick = { if (count > 0) count-- }) { Text("Decrement -") }
            }
        }
    }
}
`;
      changes.push({
        type: 'create',
        path: isAndroid ? 'app/src/main/kotlin/com/codingide/app/CounterComponent.kt' : 'src/Counter.tsx',
        description: 'Create CounterComponent with reactive remember state and increment/decrement buttons',
        newContent: counterSnippet,
      });

      return {
        userPrompt: prompt,
        summary: 'Propose Interactive Counter Component with State',
        changes,
      };
    }

    // Case 3: Profile / User Dashboard
    if (q.includes('profile') || q.includes('dashboard') || q.includes('user')) {
      const profileCode = `package ${pkg}

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp

@Composable
fun UserProfileScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            modifier = Modifier.size(90.dp).clip(CircleShape),
            color = MaterialTheme.colorScheme.primaryContainer
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("JD", style = MaterialTheme.typography.headlineMedium)
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text("Jane Doe", style = MaterialTheme.typography.headlineSmall)
        Text("jane.doe@example.com", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(24.dp))
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Account Information", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Role: Developer", style = MaterialTheme.typography.bodyMedium)
                Text("Tier: Pro Architect", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}
`;
      changes.push({
        type: 'create',
        path: isAndroid ? 'app/src/main/kotlin/com/codingide/app/UserProfileScreen.kt' : 'src/Profile.tsx',
        description: 'Create UserProfileScreen with avatar circle, user information card, and typography',
        newContent: profileCode,
      });

      return {
        userPrompt: prompt,
        summary: 'Propose User Profile Dashboard Screen',
        changes,
      };
    }

    // Default Fallback: General Composable / Component Generator
    const cleanName = prompt.replace(/[^a-zA-Z0-9]/g, '');
    const compName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1) || 'CustomFeature';
    const genericCode = `package ${pkg}

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ${compName}View() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "${prompt}",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "Engineered through CODING IDE Natural Language Command.",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}
`;
    changes.push({
        type: 'create',
        path: isAndroid ? `app/src/main/kotlin/com/codingide/app/${compName}View.kt` : `src/${compName}View.tsx`,
        description: `Create ${compName}View based on request: "${prompt}"`,
        newContent: genericCode,
    });

    return {
      userPrompt: prompt,
      summary: `Propose ${compName} Architecture`,
      changes,
    };
  },
};
