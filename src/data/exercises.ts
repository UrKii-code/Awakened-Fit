import { Exercise } from '../types/hunter';

export const EXERCISE_LIBRARY: Exercise[] = [
  // --- STRENGTH (Weight & Bodyweight) ---
  {
    id: 'pushups',
    name: 'Push-Ups (Awakened Form)',
    category: 'bodyweight',
    primaryAttribute: 'strength',
    secondaryAttribute: 'vitality',
    equipmentRequired: ['Bodyweight'],
    targetMuscles: ['Chest', 'Triceps', 'Anterior Deltoids', 'Core'],
    difficulty: 'beginner',
    instructions: [
      'Maintain a rigid plank position from head to heels.',
      'Lower chest until 2 inches above the ground while keeping elbows at a 45-degree angle.',
      'Press upward with power, fully extending arms without shrugging shoulders.'
    ],
    defaultSets: 3,
    defaultReps: 12,
    defaultRestSeconds: 60,
    expPerSet: 15,
    illustrationSvgId: 'pushups',
  },
  {
    id: 'pullups',
    name: 'Overhand Pull-Ups',
    category: 'bodyweight',
    primaryAttribute: 'strength',
    secondaryAttribute: 'agility',
    equipmentRequired: ['Pull-Up Bar'],
    targetMuscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids', 'Grip'],
    difficulty: 'intermediate',
    instructions: [
      'Grip the bar slightly wider than shoulder-width with palms facing away.',
      'Depress scapulae, then pull chest toward the bar by driving elbows down.',
      'Lower under complete control to a dead hang position before the next rep.'
    ],
    defaultSets: 3,
    defaultReps: 6,
    defaultRestSeconds: 90,
    expPerSet: 25,
    illustrationSvgId: 'pullups',
  },
  {
    id: 'barbell_bench_press',
    name: 'Barbell Bench Press',
    category: 'strength',
    primaryAttribute: 'strength',
    secondaryAttribute: 'vitality',
    equipmentRequired: ['Barbell', 'Flat Bench', 'Weight Plates'],
    targetMuscles: ['Pectoralis Major', 'Triceps', 'Shoulders'],
    difficulty: 'intermediate',
    instructions: [
      'Plant feet flat into the ground and pinch shoulder blades together.',
      'Unrack barbell and slowly lower the bar directly to mid-chest.',
      'Explosively press upward, maintaining glute and upper back contact on the bench.'
    ],
    defaultSets: 4,
    defaultReps: 8,
    defaultRestSeconds: 90,
    expPerSet: 30,
    illustrationSvgId: 'bench_press',
  },
  {
    id: 'goblet_squat',
    name: 'Dumbbell / Kettlebell Goblet Squat',
    category: 'strength',
    primaryAttribute: 'strength',
    secondaryAttribute: 'vitality',
    equipmentRequired: ['Dumbbell or Kettlebell'],
    targetMuscles: ['Quadriceps', 'Glutes', 'Core', 'Upper Back'],
    difficulty: 'beginner',
    instructions: [
      'Hold a single weight tight against your chest under your chin.',
      'Descend by pushing hips back and knees out until thighs are parallel to the floor.',
      'Drive through the heels to return to standing, locking out hips.'
    ],
    defaultSets: 3,
    defaultReps: 10,
    defaultRestSeconds: 60,
    expPerSet: 20,
    illustrationSvgId: 'squats',
  },
  {
    id: 'deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'strength',
    primaryAttribute: 'strength',
    secondaryAttribute: 'vitality',
    equipmentRequired: ['Barbell', 'Weight Plates'],
    targetMuscles: ['Hamstrings', 'Glutes', 'Spinal Erectors', 'Traps', 'Forearms'],
    difficulty: 'advanced',
    instructions: [
      'Step up to the bar so it cuts over mid-foot. Hinge at hips and grip the bar.',
      'Brace core, engage lats, and pull the slack out of the barbell.',
      'Push the floor away through mid-foot and stand upright without hyperextending.'
    ],
    defaultSets: 3,
    defaultReps: 5,
    defaultRestSeconds: 120,
    expPerSet: 40,
    illustrationSvgId: 'deadlift',
  },

  // --- CARDIO / ENDURANCE ---
  {
    id: 'tempo_run',
    name: 'Hunter Distance Run (Outdoor / Treadmill)',
    category: 'cardio',
    primaryAttribute: 'endurance',
    secondaryAttribute: 'agility',
    equipmentRequired: ['Running Shoes'],
    targetMuscles: ['Cardiovascular System', 'Calves', 'Quadriceps', 'Hamstrings'],
    difficulty: 'beginner',
    instructions: [
      'Warm up with a brisk 3-minute walking stride.',
      'Sustain a steady conversational aerobic pace (RPE 6-7).',
      'Maintain an upright posture with relaxed shoulders and smooth rhythm.'
    ],
    defaultSets: 1,
    defaultDurationSeconds: 1200, // 20 minutes
    defaultRestSeconds: 0,
    expPerSet: 50,
    illustrationSvgId: 'run',
  },
  {
    id: 'jump_rope_intervals',
    name: 'Speed Jump Rope Intervals',
    category: 'cardio',
    primaryAttribute: 'endurance',
    secondaryAttribute: 'agility',
    equipmentRequired: ['Jump Rope'],
    targetMuscles: ['Calves', 'Forearms', 'Core', 'Aerobic Base'],
    difficulty: 'intermediate',
    instructions: [
      'Stay on the balls of your feet with small, controlled hops.',
      'Rotate the rope strictly with wrist snaps rather than full arm swings.',
      'Alternate between 45 seconds of active jumping and 15 seconds of recovery.'
    ],
    defaultSets: 5,
    defaultDurationSeconds: 60,
    defaultRestSeconds: 30,
    expPerSet: 15,
    illustrationSvgId: 'jump_rope',
  },
  {
    id: 'stationary_cycling',
    name: 'Zone 2 Stationary Cycling',
    category: 'cardio',
    primaryAttribute: 'endurance',
    secondaryAttribute: 'vitality',
    equipmentRequired: ['Stationary Bike'],
    targetMuscles: ['Quadriceps', 'Glutes', 'Cardiovascular System'],
    difficulty: 'beginner',
    instructions: [
      'Maintain continuous cadence between 80-90 RPM with moderate resistance.',
      'Breathe through the nose to verify aerobic Zone 2 threshold.',
      'Hold stable posture with light grip on handlebars.'
    ],
    defaultSets: 1,
    defaultDurationSeconds: 1500, // 25 mins
    defaultRestSeconds: 0,
    expPerSet: 45,
    illustrationSvgId: 'cycle',
  },

  // --- AGILITY & SPRINTS ---
  {
    id: 'high_intensity_burpees',
    name: 'Tactical Explosive Burpees',
    category: 'agility',
    primaryAttribute: 'agility',
    secondaryAttribute: 'endurance',
    equipmentRequired: ['Bodyweight'],
    targetMuscles: ['Full Body', 'Anaerobic Engine', 'Core'],
    difficulty: 'intermediate',
    instructions: [
      'From a standing position, drop hands to ground and kick feet back into a plank.',
      'Perform a rapid pushup chest-to-deck.',
      'Snap feet forward under hips and explode vertically with hands overhead.'
    ],
    defaultSets: 4,
    defaultReps: 10,
    defaultRestSeconds: 45,
    expPerSet: 20,
    illustrationSvgId: 'burpee',
  },
  {
    id: 'mountain_climbers',
    name: 'Rapid Mountain Climbers',
    category: 'agility',
    primaryAttribute: 'agility',
    secondaryAttribute: 'endurance',
    equipmentRequired: ['Bodyweight'],
    targetMuscles: ['Hip Flexors', 'Abdominals', 'Shoulders'],
    difficulty: 'beginner',
    instructions: [
      'Start in a push-up plank with shoulders stacked over wrists.',
      'Drive one knee briskly toward your chest without elevating hips.',
      'Quickly switch legs in a sprinting cadence.'
    ],
    defaultSets: 3,
    defaultDurationSeconds: 30,
    defaultRestSeconds: 30,
    expPerSet: 15,
    illustrationSvgId: 'climbers',
  },

  // --- MOBILITY & RECOVERY ---
  {
    id: 'worlds_greatest_stretch',
    name: "World's Greatest Dynamic Stretch",
    category: 'mobility',
    primaryAttribute: 'agility',
    secondaryAttribute: 'vitality',
    equipmentRequired: ['Bodyweight / Mat'],
    targetMuscles: ['Thoracic Spine', 'Hip Flexors', 'Hamstrings', 'Groin'],
    difficulty: 'beginner',
    instructions: [
      'Step forward into a deep lunge and place both hands on the inside of front foot.',
      'Reach the inside elbow toward the floor, then rotate that arm upward toward the ceiling.',
      'Shift hips back to straighten front leg and stretch hamstring. Repeat 5 times per side.'
    ],
    defaultSets: 2,
    defaultReps: 6,
    defaultRestSeconds: 30,
    expPerSet: 12,
    illustrationSvgId: 'mobility',
  },
  {
    id: 'cat_cow_thoracic_flow',
    name: 'Cat-Cow Spinal Restoration',
    category: 'recovery',
    primaryAttribute: 'vitality',
    secondaryAttribute: 'discipline',
    equipmentRequired: ['Mat'],
    targetMuscles: ['Spine', 'Neck', 'Abdominals', 'Paraspinal Muscles'],
    difficulty: 'beginner',
    instructions: [
      'On hands and knees, inhale deeply and drop belly toward the mat, gazing up (Cow).',
      'Exhale and tuck tailbone, arching spine toward ceiling and drawing chin to chest (Cat).',
      'Move fluidly with breath to relieve lower back tension.'
    ],
    defaultSets: 2,
    defaultReps: 10,
    defaultRestSeconds: 30,
    expPerSet: 10,
    illustrationSvgId: 'cat_cow',
  },

  // --- CORE & DISCIPLINE ---
  {
    id: 'plank_iron_hold',
    name: 'Iron Guard Plank Hold',
    category: 'core',
    primaryAttribute: 'discipline',
    secondaryAttribute: 'vitality',
    equipmentRequired: ['Bodyweight / Mat'],
    targetMuscles: ['Transverse Abdominis', 'Rectus Abdominis', 'Glutes', 'Shoulders'],
    difficulty: 'beginner',
    instructions: [
      'Rest on forearms and toes with elbows directly under shoulders.',
      'Squeeze glutes and brace abdominal wall as if preparing for a punch.',
      'Do not allow hips to sag or pike upwards. Breathe steadily through your teeth.'
    ],
    defaultSets: 3,
    defaultDurationSeconds: 45,
    defaultRestSeconds: 45,
    expPerSet: 15,
    illustrationSvgId: 'plank',
  },
  {
    id: 'hanging_leg_raises',
    name: 'Hanging Strict Leg Raises',
    category: 'core',
    primaryAttribute: 'discipline',
    secondaryAttribute: 'strength',
    equipmentRequired: ['Pull-Up Bar'],
    targetMuscles: ['Lower Abdominals', 'Hip Flexors', 'Grip'],
    difficulty: 'intermediate',
    instructions: [
      'Hang from bar with overhand grip without swinging.',
      'Initiate movement by posteriorly tilting pelvis and raising legs straight to parallel.',
      'Lower legs slowly with a 3-second negative eccentric tempo.'
    ],
    defaultSets: 3,
    defaultReps: 8,
    defaultRestSeconds: 60,
    expPerSet: 20,
    illustrationSvgId: 'leg_raise',
  }
];

export const WORKOUT_TEMPLATES = [
  {
    id: 'awakening_trial_home',
    title: 'Trial of Awakening (Home Bodyweight)',
    description: 'The foundational trial for every newly awakened Hunter. Calibrated for home training with zero equipment.',
    environment: 'home',
    planType: 'strength_foundations',
    exerciseIds: ['pushups', 'goblet_squat', 'high_intensity_burpees', 'plank_iron_hold', 'worlds_greatest_stretch'],
    estimatedMinutes: 25,
    difficulty: 'beginner',
    primaryBenefit: 'Solidifies fundamental movement mechanics and sparks initial attribute awakening.'
  },
  {
    id: 'titan_forge_gym',
    title: 'Titan Forge (Gym Heavy Strength)',
    description: 'Designed for Hunters with access to free weights and commercial gym equipment.',
    environment: 'gym',
    planType: 'strength_foundations',
    exerciseIds: ['barbell_bench_press', 'deadlift', 'pullups', 'hanging_leg_raises', 'cat_cow_thoracic_flow'],
    estimatedMinutes: 45,
    difficulty: 'intermediate',
    primaryBenefit: 'Maximal Strength and Vitality attribute acceleration.'
  },
  {
    id: 'shadow_stride_cardio',
    title: 'Shadow Stride (Agility & Cardio)',
    description: 'Cardiovascular conditioning and quick footwork for rapid stamina progression.',
    environment: 'outdoors',
    planType: 'endurance_surge',
    exerciseIds: ['tempo_run', 'jump_rope_intervals', 'mountain_climbers', 'plank_iron_hold'],
    estimatedMinutes: 30,
    difficulty: 'beginner',
    primaryBenefit: 'Develops Endurance and Agility; elevates Hunter stamina pool.'
  },
  {
    id: 'aegis_restoration',
    title: 'Aegis Active Recovery & Mobility',
    description: 'Essential joint decompression, tissue hydration, and mindful discipline.',
    environment: 'home',
    planType: 'vital_mobility',
    exerciseIds: ['worlds_greatest_stretch', 'cat_cow_thoracic_flow', 'plank_iron_hold'],
    estimatedMinutes: 20,
    difficulty: 'beginner',
    primaryBenefit: 'Restores Vitality without fatigue penalty; maintains streak without burnout.'
  }
];
