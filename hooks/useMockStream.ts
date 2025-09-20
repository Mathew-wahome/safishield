
import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertLevel } from '../types';

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const generateMockAlert = (): Alert => {
    const amounts = [500, 12000, 75000, 95000, 150000];
    const reasons = [
        ['Amount is 3.1x user average'],
        ['Transaction at 03:45 AM', 'Unusual merchant category'],
        ['Geo-jump detected: 500km in 10 mins'],
        ['Rapid micro-cashout burst (3 in 5 mins)'],
        ['High-risk agent cluster similarity: 0.91'],
    ];
    const levels: AlertLevel[] = [AlertLevel.Low, AlertLevel.Medium, AlertLevel.High, AlertLevel.Critical];

    const randIndex = Math.floor(Math.random() * amounts.length);
    const levelIndex = Math.min(randIndex, levels.length - 1);

    return {
        id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date(),
        amount: amounts[randIndex],
        agentId: `AGT${String(Math.floor(randomBetween(1, 200))).padStart(3, '0')}`,
        from: `2547${Math.floor(randomBetween(10000000, 99999999))}`,
        to: `2547${Math.floor(randomBetween(10000000, 99999999))}`,
        level: levels[levelIndex],
        reasons: reasons[randIndex],
        location: {
            lat: randomBetween(-1.35, -1.25),
            lon: randomBetween(36.75, 36.85),
        },
        model: Math.random() > 0.5 ? 'rule' : 'iso_forest',
    };
};


export const useMockStream = (initialAlerts: Alert[], isActive: boolean = true) => {
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

    const streamCallback = useCallback(() => {
        if (isActive) {
            const newAlert = generateMockAlert();
            setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 50)); // Keep max 50 alerts
        }
    }, [isActive]);

    useEffect(() => {
        const interval = setInterval(streamCallback, randomBetween(1500, 4000));
        return () => clearInterval(interval);
    }, [streamCallback]);

    return alerts;
};
