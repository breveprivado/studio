"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DailyMissionCard = () => {
    const [mission, setMission] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const savedMission = localStorage.getItem('dailyMission');
        if (savedMission) {
            setMission(savedMission);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('dailyMission', mission);
        setIsEditing(false);
        toast({
            title: 'Misión Guardada',
            description: 'Tu misión diaria ha sido actualizada.',
        });
    };

    return (
        <Card>
            <CardHeader className="p-4 pb-2 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Misión Diaria
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
                    {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {isEditing ? (
                    <Input
                        value={mission}
                        onChange={(e) => setMission(e.target.value)}
                        placeholder="Define tu objetivo de hoy..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                ) : (
                    <p className="text-sm font-semibold h-10 flex items-center">
                        {mission || 'Define tu misión para hoy...'}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default DailyMissionCard;
