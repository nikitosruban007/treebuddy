
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { colors } from '@/styles/commonStyles';
import { translate } from '@/constants/translations';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firebase';
import { TASKS } from '@/constants/tasks';
import { notificationService } from '@/services/notifications';
import { getTreeStageByXP } from '@/constants/treeStages';
import * as ImagePicker from 'expo-image-picker';
import { incrementDemoCommunityProgress } from '@/utils/communityProgress';
import { getTodayKey, getYesterdayKey } from '@/utils/date';
import { useSettings } from '@/contexts/SettingsContext';

export default function CameraScreen() {
  const { taskId, xpReward, dateKey } = useLocalSearchParams();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [detecting, setDetecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<any>(null);
  const { user, userData, refreshUserData, isDemoMode, updateDemoUserData } = useAuth();
  const { settings } = useSettings();

  const task = TASKS.find(t => t.id === taskId);
  const xpOverride = typeof xpReward === 'string' ? Number(xpReward) : Array.isArray(xpReward) ? Number(xpReward[0]) : undefined;
  const finalXpReward = Number.isFinite(xpOverride) && (xpOverride as number) > 0 ? (xpOverride as number) : task?.xpReward;

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
    if (!microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [cameraPermission, microphonePermission]);

  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        await verifyMedia(result.assets[0].uri, 'video');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати відео');
    }
  };

  const recordVideo = async () => {
    if (!cameraRef.current) return;

    try {
      if (isRecording) {
        cameraRef.current.stopRecording();
        setIsRecording(false);
      } else {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 30,
        });
        setIsRecording(false);
        if (video) {
          await verifyMedia(video.uri, 'video');
        }
      }
    } catch (error) {
      console.error('Error recording video:', error);
      setIsRecording(false);
      Alert.alert('Помилка', 'Не вдалося записати відео');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      await verifyMedia(photo.uri, 'photo');
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Помилка', 'Не вдалося зробити фото');
    }
  };

  const verifyMedia = async (mediaUri: string, mediaType: 'photo' | 'video') => {
    if (!task || !userData) return;

    setDetecting(true);
    try {
      const oldLevel = getTreeStageByXP(userData.xp).level;
      const xpToAdd = finalXpReward || task.xpReward;
      const newXP = userData.xp + xpToAdd;

      const today = typeof dateKey === 'string' && dateKey ? dateKey : getTodayKey();
      const yesterday = getYesterdayKey();
      const lastKey = userData.lastActionDateKey;
      const prevStreak = userData.streakCount || 0;
      const nextStreak = lastKey === today
        ? prevStreak
        : (lastKey === yesterday ? prevStreak + 1 : 1);
      
      if (isDemoMode) {
        const completedTask = {
          taskId: task.id,
          xpEarned: xpToAdd,
          completedAt: new Date().toISOString(),
        };
        
        await updateDemoUserData({
          xp: newXP,
          completedTasks: [...(userData.completedTasks || []), completedTask],
          streakCount: nextStreak,
          lastActionDateKey: today,
        });
        await incrementDemoCommunityProgress(xpToAdd);
      } else if (user) {
        await firestoreService.updateXP(user.uid, xpToAdd, task.id, {
          todayKey: today,
          yesterdayKey: yesterday,
        });
        await firestoreService.incrementCommunityProgress(xpToAdd);
      }
      
      await refreshUserData();
      
      const newLevel = getTreeStageByXP(newXP).level;
      
      if (newLevel > oldLevel) {
        await notificationService.notifyTreeLevelUp(newLevel);
      }
      
      router.replace(`/reward?taskId=${task.id}&xp=${xpToAdd}&newXP=${newXP}&leveledUp=${newLevel > oldLevel ? '1' : '0'}&dateKey=${today}&lang=${settings.language}`);
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('Помилка', 'Не вдалося підтвердити дію');
    } finally {
      setDetecting(false);
    }
  };

  if (!cameraPermission || !microphonePermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Потрібен доступ до камери та мікрофону</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Надати доступ до камери</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={requestMicrophonePermission}>
          <Text style={styles.buttonText}>Надати доступ до мікрофону</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{task?.title || translate('camera_title', 'ua')}</Text>
        <View style={styles.placeholder} />
      </View>

      <CameraView 
        style={styles.camera} 
        ref={cameraRef} 
        facing="back"
        mode="video"
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.targetFrame} />
          <Text style={styles.instructionText}>
            {task?.description || 'Запишіть відео або зробіть фото'}
          </Text>
          <Text style={styles.hintText}>
            💡 Підказка: Краще записати коротке відео (до 30 сек)
          </Text>
        </View>
      </CameraView>

      {detecting && (
        <View style={styles.detectingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.detectingText}>{translate('camera_detecting', 'ua')}</Text>
        </View>
      )}

      {!detecting && (
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={pickVideo}
          >
            <MaterialCommunityIcons name="folder-open" size={32} color={colors.white} />
            <Text style={styles.secondaryButtonText}>Вибрати відео</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.captureButton, isRecording && styles.recordingButton]} 
            onPress={recordVideo}
          >
            <View style={[styles.captureButtonInner, isRecording && styles.recordingButtonInner]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={takePicture}
          >
            <MaterialCommunityIcons name="camera" size={32} color={colors.white} />
            <Text style={styles.secondaryButtonText}>Зробити фото</Text>
          </TouchableOpacity>
        </View>
      )}

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Запис...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  placeholder: {
    width: 44,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: 20,
  },
  instructionText: {
    fontSize: 16,
    color: colors.white,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  hintText: {
    fontSize: 14,
    color: colors.white,
    marginTop: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  detectingText: {
    fontSize: 18,
    color: colors.white,
    marginTop: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.error,
  },
  recordingButton: {
    backgroundColor: colors.error,
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  secondaryButton: {
    alignItems: 'center',
    gap: 4,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 40,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordingIndicator: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});
