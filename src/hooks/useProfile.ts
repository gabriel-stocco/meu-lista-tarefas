import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import * as ProfileRepository from "../database/profileRepository";
import { UserProfile, SaveProfileInput } from "../types/profile";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ProfileRepository.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleSave = useCallback(
    async (input: SaveProfileInput) => {
      await ProfileRepository.saveProfile(input);
      await loadProfile();
    },
    [loadProfile],
  );

  return { profile, loading, saveProfile: handleSave };
}
