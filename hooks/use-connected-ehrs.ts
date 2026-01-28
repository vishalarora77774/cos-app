import { processFastenHealthDataFromFile } from '@/services/fasten-health-processor';
import { USE_MOCK_DATA, getFastenHealthDataName } from '@/services/fasten-health-config';
import { useCallback, useEffect, useState } from 'react';

export interface ConnectedHospital {
  id: string;
  name: string;
  provider: string;
  connectedDate: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export function useConnectedEhrs() {
  const [connectedHospitals, setConnectedHospitals] = useState<ConnectedHospital[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  const loadClinics = useCallback(async () => {
    setIsLoadingClinics(true);
    try {
      const dataSourceName = getFastenHealthDataName();
      console.log(`🔄 Loading clinics from ${dataSourceName} data (USE_MOCK_DATA: ${USE_MOCK_DATA})`);

      const processedData = await processFastenHealthDataFromFile();

      const hospitals: ConnectedHospital[] = processedData.clinics.map((clinic, index) => {
        const connectionDate = new Date();
        connectionDate.setMonth(connectionDate.getMonth() - (index * 2));

        const providerNames = ['EPIC', 'Cerner', 'Allscripts', 'athenahealth', 'NextGen'];
        const provider = providerNames[index % providerNames.length];

        const addressParts = [];
        if (clinic.address?.line && clinic.address.line.length > 0) {
          addressParts.push(clinic.address.line[0]);
        }
        if (clinic.address?.city) {
          addressParts.push(clinic.address.city);
        }
        if (clinic.address?.state) {
          addressParts.push(clinic.address.state);
        }
        if (clinic.address?.zip) {
          addressParts.push(clinic.address.zip);
        }
        const fullAddress = addressParts.join(', ');

        return {
          id: clinic.id,
          name: clinic.name,
          provider: provider,
          connectedDate: connectionDate.toISOString().split('T')[0],
          address: fullAddress || undefined,
          city: clinic.address?.city,
          state: clinic.address?.state,
          phone: clinic.phone,
          email: clinic.email,
        };
      });

      setConnectedHospitals(hospitals);
      console.log(`✅ Loaded ${hospitals.length} connected clinics from ${dataSourceName} data`);
      if (hospitals.length > 0) {
        console.log(`📋 Clinic names: ${hospitals.map(h => h.name).join(', ')}`);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
      setConnectedHospitals([]);
    } finally {
      setIsLoadingClinics(false);
    }
  }, []);

  useEffect(() => {
    loadClinics();
  }, [loadClinics]);

  return {
    connectedHospitals,
    isLoadingClinics,
    refreshConnectedEhrs: loadClinics,
  };
}
