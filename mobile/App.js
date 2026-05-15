import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginAgainScreen from './src/screens/LoginAgainScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import EvaluationRulesScreen from './src/screens/EvaluationRulesScreen';

import HomeScreen from './src/screens/HomeScreen';
import DailyChallengeScreen from './src/screens/DailyChallengeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import PracticeScreen from './src/screens/PracticeScreen';

import InterviewDomainScreen from './src/screens/InterviewDomainScreen';
import SetupScreen from './src/screens/SetupScreen';
import InterviewScreen from './src/screens/InterviewScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import QuestionDetailsScreen from './src/screens/QuestionDetailsScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import ResultScreen from './src/screens/ResultScreen';

import AdminLoginScreen from './src/screens/admin/AdminLoginScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminInsightsScreen from './src/screens/admin/AdminInsightsScreen';
import AdminUsersScreen from './src/screens/admin/AdminUsersScreen';
import AdminQuestionsScreen from './src/screens/admin/AdminQuestionsScreen';
import AdminAddQuestionScreen from './src/screens/admin/AdminAddQuestionScreen';
import AdminSettingsScreen from './src/screens/admin/AdminSettingsScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: '#fff',
    primary: colors.primary,
    border: colors.divider
  }
};

function Routes() {
  const { token, user, loading } = useAuth();
  if (loading) return null;
  const isAdmin = user?.role === 'admin';
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        isAdmin ? (
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminInsights" component={AdminInsightsScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminQuestions" component={AdminQuestionsScreen} />
            <Stack.Screen name="AdminAddQuestion" component={AdminAddQuestionScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="EvaluationRules" component={EvaluationRulesScreen} />
            <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Practice" component={PracticeScreen} />
            <Stack.Screen name="InterviewDomain" component={InterviewDomainScreen} />
            <Stack.Screen name="InterviewSetup" component={SetupScreen} />
            <Stack.Screen name="Interview" component={InterviewScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="QuestionDetails" component={QuestionDetailsScreen} />
            <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="LoginAgain" component={LoginAgainScreen} />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <Routes />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
