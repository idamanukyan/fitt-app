"""
MuscleWiki exercise seed data.
Comprehensive exercise database covering all muscle groups, equipment types, and categories.
"""

MUSCLEWIKI_EXERCISES = [
    # ==================== CHEST ====================
    {
        "name": "Barbell Bench Press",
        "muscle": "chest",
        "secondary_muscles": ["triceps", "shoulders"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Lie flat on a bench with your feet firmly on the ground",
            "Grip the barbell slightly wider than shoulder-width",
            "Unrack the bar and hold it directly above your chest",
            "Lower the bar to your mid-chest in a controlled motion",
            "Press the bar back up to the starting position"
        ],
        "tips": ["Keep elbows at 45-degree angle", "Maintain slight arch in lower back", "Drive through your feet"],
        "mistakes": ["Bouncing bar off chest", "Flaring elbows too wide", "Lifting hips off bench"],
        "tags": ["compound", "push", "powerlifting"],
        "is_popular": True,
        "is_featured": True
    },
    {
        "name": "Dumbbell Bench Press",
        "muscle": "chest",
        "secondary_muscles": ["triceps", "shoulders"],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Lie on a flat bench holding dumbbells at chest level",
            "Press the dumbbells up until arms are extended",
            "Lower the weights back to the starting position",
            "Keep the dumbbells in line with your mid-chest"
        ],
        "tips": ["Control the weights on the way down", "Don't lock out elbows completely"],
        "tags": ["compound", "push"],
        "is_popular": True
    },
    {
        "name": "Incline Dumbbell Press",
        "muscle": "chest",
        "secondary_muscles": ["shoulders", "triceps"],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Set bench to 30-45 degree incline",
            "Hold dumbbells at shoulder level",
            "Press weights up and slightly together",
            "Lower with control to starting position"
        ],
        "tips": ["Don't set incline too steep", "Focus on upper chest contraction"],
        "tags": ["compound", "push", "upper chest"]
    },
    {
        "name": "Cable Fly",
        "muscle": "chest",
        "secondary_muscles": [],
        "equipment": "cable",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Stand between cable machines with handles at chest height",
            "Step forward slightly with arms extended to sides",
            "Bring handles together in front of chest in arc motion",
            "Slowly return to starting position"
        ],
        "tips": ["Maintain slight bend in elbows", "Squeeze chest at peak contraction"],
        "tags": ["isolation", "chest fly"]
    },
    {
        "name": "Push-Up",
        "muscle": "chest",
        "secondary_muscles": ["triceps", "shoulders", "core"],
        "equipment": "bodyweight",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Start in plank position with hands slightly wider than shoulders",
            "Lower your body until chest nearly touches the floor",
            "Push back up to starting position",
            "Keep body in straight line throughout"
        ],
        "tips": ["Engage core throughout", "Don't let hips sag"],
        "tags": ["compound", "push", "calisthenics"],
        "is_popular": True
    },
    {
        "name": "Dip",
        "muscle": "chest",
        "secondary_muscles": ["triceps", "shoulders"],
        "equipment": "dip-bars",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Grip parallel bars and lift yourself up",
            "Lean forward slightly for chest emphasis",
            "Lower body by bending elbows until shoulders are below elbows",
            "Push back up to starting position"
        ],
        "tips": ["Lean forward to target chest more", "Control the descent"],
        "tags": ["compound", "push", "calisthenics"],
        "is_popular": True
    },

    # ==================== BACK ====================
    {
        "name": "Barbell Deadlift",
        "muscle": "back",
        "secondary_muscles": ["hamstrings", "glutes", "core", "traps"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "advanced",
        "instructions": [
            "Stand with feet hip-width apart, bar over mid-foot",
            "Bend at hips and knees to grip bar outside your legs",
            "Keep back flat and chest up",
            "Drive through heels and extend hips and knees simultaneously",
            "Stand tall at the top, then lower with control"
        ],
        "tips": ["Keep bar close to body", "Don't round lower back", "Engage lats before lifting"],
        "mistakes": ["Rounding back", "Starting with hips too high", "Bar drifting away from body"],
        "tags": ["compound", "pull", "powerlifting", "hinge"],
        "is_popular": True,
        "is_featured": True
    },
    {
        "name": "Pull-Up",
        "muscle": "lats",
        "secondary_muscles": ["biceps", "rear-deltoids", "core"],
        "equipment": "pull-up-bar",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Hang from bar with overhand grip, hands wider than shoulders",
            "Pull yourself up until chin is over the bar",
            "Lower with control to full arm extension",
            "Repeat without swinging"
        ],
        "tips": ["Initiate pull with lats, not arms", "Avoid kipping"],
        "tags": ["compound", "pull", "calisthenics", "vertical pull"],
        "is_popular": True
    },
    {
        "name": "Barbell Row",
        "muscle": "back",
        "secondary_muscles": ["biceps", "rear-deltoids", "core"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Hinge at hips with slight knee bend, back flat",
            "Grip barbell with hands shoulder-width apart",
            "Pull bar to lower chest/upper abdomen",
            "Lower with control and repeat"
        ],
        "tips": ["Keep elbows close to body", "Squeeze shoulder blades at top"],
        "tags": ["compound", "pull", "horizontal pull"],
        "is_popular": True
    },
    {
        "name": "Lat Pulldown",
        "muscle": "lats",
        "secondary_muscles": ["biceps", "rear-deltoids"],
        "equipment": "cable",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Sit at lat pulldown machine with thighs secured",
            "Grip bar wider than shoulder-width",
            "Pull bar down to upper chest",
            "Control the weight back up"
        ],
        "tips": ["Don't lean too far back", "Focus on pulling elbows down"],
        "tags": ["compound", "pull", "vertical pull"],
        "is_popular": True
    },
    {
        "name": "Seated Cable Row",
        "muscle": "back",
        "secondary_muscles": ["biceps", "rear-deltoids"],
        "equipment": "cable",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Sit at cable row machine with feet on platform",
            "Grip handle with arms extended",
            "Pull handle to abdomen, squeezing shoulder blades",
            "Extend arms with control"
        ],
        "tips": ["Keep torso stable", "Don't use momentum"],
        "tags": ["compound", "pull", "horizontal pull"]
    },
    {
        "name": "Single-Arm Dumbbell Row",
        "muscle": "lats",
        "secondary_muscles": ["biceps", "rear-deltoids"],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Place one knee and hand on bench",
            "Hold dumbbell in free hand, arm extended",
            "Row dumbbell to hip, elbow close to body",
            "Lower with control"
        ],
        "tips": ["Keep back flat", "Don't rotate torso"],
        "tags": ["compound", "pull", "unilateral"]
    },

    # ==================== SHOULDERS ====================
    {
        "name": "Overhead Press",
        "muscle": "shoulders",
        "secondary_muscles": ["triceps", "core"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Hold barbell at shoulder level, grip slightly wider than shoulders",
            "Press bar overhead until arms are fully extended",
            "Lower bar back to shoulders with control"
        ],
        "tips": ["Keep core tight", "Don't excessively arch back"],
        "tags": ["compound", "push", "vertical push"],
        "is_popular": True
    },
    {
        "name": "Dumbbell Shoulder Press",
        "muscle": "shoulders",
        "secondary_muscles": ["triceps"],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Sit on bench with back support, dumbbells at shoulder level",
            "Press dumbbells overhead until arms extended",
            "Lower with control to starting position"
        ],
        "tips": ["Don't lock out elbows", "Keep core engaged"],
        "tags": ["compound", "push", "vertical push"],
        "is_popular": True
    },
    {
        "name": "Lateral Raise",
        "muscle": "shoulders",
        "secondary_muscles": [],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Stand with dumbbells at sides",
            "Raise arms out to sides until parallel to floor",
            "Lower with control"
        ],
        "tips": ["Slight bend in elbows", "Don't swing weights"],
        "tags": ["isolation", "side delts"],
        "is_popular": True
    },
    {
        "name": "Face Pull",
        "muscle": "rear-deltoids",
        "secondary_muscles": ["traps", "rhomboids"],
        "equipment": "cable",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Set cable at upper chest height with rope attachment",
            "Pull rope toward face, separating ends",
            "Squeeze shoulder blades together at end",
            "Return with control"
        ],
        "tips": ["Keep elbows high", "External rotate at end of movement"],
        "tags": ["isolation", "rear delts", "shoulder health"],
        "is_popular": True
    },
    {
        "name": "Front Raise",
        "muscle": "shoulders",
        "secondary_muscles": [],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Stand with dumbbells in front of thighs",
            "Raise one or both arms forward to shoulder height",
            "Lower with control"
        ],
        "tips": ["Don't swing weights", "Keep slight bend in elbows"],
        "tags": ["isolation", "front delts"]
    },

    # ==================== ARMS ====================
    {
        "name": "Barbell Curl",
        "muscle": "biceps",
        "secondary_muscles": ["forearms"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Stand with barbell, arms extended, palms facing forward",
            "Curl bar toward shoulders, keeping elbows stationary",
            "Squeeze biceps at top",
            "Lower with control"
        ],
        "tips": ["Don't swing body", "Keep elbows at sides"],
        "tags": ["isolation", "curl"],
        "is_popular": True
    },
    {
        "name": "Dumbbell Hammer Curl",
        "muscle": "biceps",
        "secondary_muscles": ["forearms"],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Stand with dumbbells at sides, palms facing each other",
            "Curl weights toward shoulders",
            "Lower with control"
        ],
        "tips": ["Keep palms facing each other throughout", "Don't swing"],
        "tags": ["isolation", "curl", "brachialis"]
    },
    {
        "name": "Tricep Pushdown",
        "muscle": "triceps",
        "secondary_muscles": [],
        "equipment": "cable",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Stand at cable machine with bar or rope attachment",
            "Keep elbows at sides, push down until arms straight",
            "Return with control, keeping elbows stationary"
        ],
        "tips": ["Don't let elbows drift forward", "Squeeze triceps at bottom"],
        "tags": ["isolation", "triceps"],
        "is_popular": True
    },
    {
        "name": "Skull Crusher",
        "muscle": "triceps",
        "secondary_muscles": [],
        "equipment": "ez-bar",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Lie on bench with EZ bar extended above chest",
            "Lower bar toward forehead by bending elbows",
            "Extend arms back to starting position"
        ],
        "tips": ["Keep upper arms stationary", "Control the weight"],
        "tags": ["isolation", "triceps"]
    },
    {
        "name": "Overhead Tricep Extension",
        "muscle": "triceps",
        "secondary_muscles": [],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Hold dumbbell overhead with both hands",
            "Lower weight behind head by bending elbows",
            "Extend arms back to starting position"
        ],
        "tips": ["Keep elbows close to head", "Don't arch back excessively"],
        "tags": ["isolation", "triceps", "long head"]
    },

    # ==================== LEGS ====================
    {
        "name": "Barbell Squat",
        "muscle": "quads",
        "secondary_muscles": ["glutes", "hamstrings", "core"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Position bar on upper back, feet shoulder-width apart",
            "Brace core and descend by bending knees and hips",
            "Lower until thighs are parallel to floor or below",
            "Drive through heels to stand"
        ],
        "tips": ["Keep chest up", "Knees track over toes", "Don't let knees cave in"],
        "mistakes": ["Knees caving in", "Rounding back", "Rising on toes"],
        "tags": ["compound", "squat", "powerlifting"],
        "is_popular": True,
        "is_featured": True
    },
    {
        "name": "Leg Press",
        "muscle": "quads",
        "secondary_muscles": ["glutes", "hamstrings"],
        "equipment": "machine",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Sit in leg press machine with feet shoulder-width on platform",
            "Lower weight by bending knees toward chest",
            "Press through heels to extend legs",
            "Don't lock knees at top"
        ],
        "tips": ["Keep lower back pressed against seat", "Control the descent"],
        "tags": ["compound", "push"],
        "is_popular": True
    },
    {
        "name": "Romanian Deadlift",
        "muscle": "hamstrings",
        "secondary_muscles": ["glutes", "lower-back"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Hold barbell with straight arms, feet hip-width",
            "Push hips back while lowering bar along legs",
            "Keep slight bend in knees, back flat",
            "Lower until hamstring stretch, then return"
        ],
        "tips": ["Feel stretch in hamstrings", "Keep bar close to legs"],
        "tags": ["compound", "hinge", "pull"],
        "is_popular": True
    },
    {
        "name": "Leg Curl",
        "muscle": "hamstrings",
        "secondary_muscles": [],
        "equipment": "machine",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Lie face down on leg curl machine",
            "Curl weight by bending knees",
            "Squeeze hamstrings at top",
            "Lower with control"
        ],
        "tips": ["Don't lift hips off pad", "Control the negative"],
        "tags": ["isolation", "hamstrings"]
    },
    {
        "name": "Leg Extension",
        "muscle": "quads",
        "secondary_muscles": [],
        "equipment": "machine",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Sit in leg extension machine with ankles behind pad",
            "Extend legs until straight",
            "Squeeze quads at top",
            "Lower with control"
        ],
        "tips": ["Don't use momentum", "Focus on quad contraction"],
        "tags": ["isolation", "quads"]
    },
    {
        "name": "Walking Lunge",
        "muscle": "quads",
        "secondary_muscles": ["glutes", "hamstrings"],
        "equipment": "dumbbell",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Hold dumbbells at sides",
            "Step forward into lunge position",
            "Lower until back knee nearly touches ground",
            "Push through front foot to step forward into next lunge"
        ],
        "tips": ["Keep torso upright", "Front knee tracks over ankle"],
        "tags": ["compound", "lunge", "unilateral"],
        "is_popular": True
    },
    {
        "name": "Calf Raise",
        "muscle": "calves",
        "secondary_muscles": [],
        "equipment": "machine",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Stand on calf raise machine with balls of feet on platform",
            "Lower heels below platform level",
            "Raise up onto toes as high as possible",
            "Lower with control"
        ],
        "tips": ["Full range of motion", "Pause at top"],
        "tags": ["isolation", "calves"]
    },

    # ==================== GLUTES ====================
    {
        "name": "Hip Thrust",
        "muscle": "glutes",
        "secondary_muscles": ["hamstrings", "core"],
        "equipment": "barbell",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Sit on ground with upper back against bench",
            "Roll barbell over hips",
            "Drive through heels to lift hips until body is straight",
            "Squeeze glutes at top, lower with control"
        ],
        "tips": ["Chin tucked", "Drive through heels", "Full hip extension at top"],
        "tags": ["compound", "glutes", "hinge"],
        "is_popular": True,
        "gender": "female"
    },
    {
        "name": "Glute Bridge",
        "muscle": "glutes",
        "secondary_muscles": ["hamstrings"],
        "equipment": "bodyweight",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Lie on back with knees bent, feet flat on floor",
            "Drive through heels to lift hips",
            "Squeeze glutes at top",
            "Lower with control"
        ],
        "tips": ["Don't hyperextend lower back", "Keep core engaged"],
        "tags": ["isolation", "glutes", "activation"],
        "gender": "female"
    },
    {
        "name": "Cable Kickback",
        "muscle": "glutes",
        "secondary_muscles": [],
        "equipment": "cable",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Attach ankle strap to low cable",
            "Face machine, holding for support",
            "Kick leg back in controlled arc",
            "Squeeze glute at top, return with control"
        ],
        "tips": ["Don't arch back", "Keep leg straight"],
        "tags": ["isolation", "glutes"],
        "gender": "female"
    },

    # ==================== CORE ====================
    {
        "name": "Plank",
        "muscle": "core",
        "secondary_muscles": ["shoulders", "glutes"],
        "equipment": "bodyweight",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Start in push-up position on forearms",
            "Keep body in straight line from head to heels",
            "Hold position while breathing steadily"
        ],
        "tips": ["Don't let hips sag or pike up", "Engage entire core"],
        "tags": ["isometric", "core", "stability"],
        "is_popular": True
    },
    {
        "name": "Dead Bug",
        "muscle": "core",
        "secondary_muscles": [],
        "equipment": "bodyweight",
        "category": "strength",
        "difficulty": "beginner",
        "instructions": [
            "Lie on back with arms extended toward ceiling",
            "Lift legs with knees bent at 90 degrees",
            "Lower opposite arm and leg toward floor",
            "Return to start and alternate"
        ],
        "tips": ["Keep lower back pressed to floor", "Move slowly"],
        "tags": ["core", "stability", "anti-extension"]
    },
    {
        "name": "Hanging Leg Raise",
        "muscle": "abs",
        "secondary_muscles": ["hip-flexors"],
        "equipment": "pull-up-bar",
        "category": "strength",
        "difficulty": "advanced",
        "instructions": [
            "Hang from pull-up bar with straight arms",
            "Raise legs until parallel to floor or higher",
            "Lower with control"
        ],
        "tips": ["Don't swing", "Curl pelvis up for more ab engagement"],
        "tags": ["core", "abs", "calisthenics"],
        "is_popular": True
    },
    {
        "name": "Cable Woodchop",
        "muscle": "obliques",
        "secondary_muscles": ["core", "shoulders"],
        "equipment": "cable",
        "category": "strength",
        "difficulty": "intermediate",
        "instructions": [
            "Set cable at high position",
            "Stand sideways to machine",
            "Pull cable diagonally across body toward opposite hip",
            "Control return to starting position"
        ],
        "tips": ["Rotate through torso", "Keep arms relatively straight"],
        "tags": ["rotation", "obliques", "functional"]
    },
    {
        "name": "Ab Wheel Rollout",
        "muscle": "abs",
        "secondary_muscles": ["shoulders", "lats"],
        "equipment": "other",
        "category": "strength",
        "difficulty": "advanced",
        "instructions": [
            "Kneel with ab wheel in front",
            "Roll wheel forward, extending body",
            "Keep core tight, don't let hips sag",
            "Roll back to starting position"
        ],
        "tips": ["Start with partial range of motion", "Squeeze abs throughout"],
        "tags": ["core", "anti-extension", "advanced"]
    },

    # ==================== STRETCHING ====================
    {
        "name": "Standing Quad Stretch",
        "muscle": "quads",
        "secondary_muscles": ["hip-flexors"],
        "equipment": "bodyweight",
        "category": "stretching",
        "difficulty": "beginner",
        "instructions": [
            "Stand on one leg, holding wall for balance if needed",
            "Grab ankle of free leg behind you",
            "Pull heel toward glute",
            "Keep knees together, hold stretch"
        ],
        "tips": ["Keep standing leg slightly bent", "Don't arch back"],
        "tags": ["stretch", "static", "quads"]
    },
    {
        "name": "Seated Hamstring Stretch",
        "muscle": "hamstrings",
        "secondary_muscles": ["lower-back"],
        "equipment": "bodyweight",
        "category": "stretching",
        "difficulty": "beginner",
        "instructions": [
            "Sit with one leg extended, other bent with foot against inner thigh",
            "Reach toward toes of extended leg",
            "Hold stretch, keep back straight"
        ],
        "tips": ["Hinge at hips", "Don't round back excessively"],
        "tags": ["stretch", "static", "hamstrings"]
    },
    {
        "name": "Pigeon Pose",
        "muscle": "glutes",
        "secondary_muscles": ["hip-flexors"],
        "equipment": "bodyweight",
        "category": "stretching",
        "difficulty": "intermediate",
        "instructions": [
            "From all fours, bring one knee forward behind wrist",
            "Extend other leg straight back",
            "Lower torso toward floor",
            "Hold stretch"
        ],
        "tips": ["Keep hips square", "Use props if needed"],
        "tags": ["stretch", "yoga", "glutes", "hips"],
        "gender": "female"
    },
    {
        "name": "Chest Doorway Stretch",
        "muscle": "chest",
        "secondary_muscles": ["shoulders"],
        "equipment": "bodyweight",
        "category": "stretching",
        "difficulty": "beginner",
        "instructions": [
            "Stand in doorway with arm at 90 degrees on frame",
            "Step through doorway to stretch chest",
            "Hold, then repeat other side"
        ],
        "tips": ["Vary arm height to target different chest fibers"],
        "tags": ["stretch", "static", "chest"]
    },
    {
        "name": "Cat-Cow Stretch",
        "muscle": "back",
        "secondary_muscles": ["core", "neck"],
        "equipment": "bodyweight",
        "category": "mobility",
        "difficulty": "beginner",
        "instructions": [
            "Start on all fours",
            "Arch back up like a cat, tucking chin",
            "Then drop belly and lift head (cow)",
            "Flow between positions"
        ],
        "tips": ["Move slowly", "Coordinate with breath"],
        "tags": ["mobility", "spine", "warmup"]
    },

    # ==================== REHAB / PAIN RELIEF ====================
    {
        "name": "Bird Dog",
        "muscle": "lower-back",
        "secondary_muscles": ["core", "glutes"],
        "equipment": "bodyweight",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Start on all fours, spine neutral",
            "Extend opposite arm and leg",
            "Hold briefly, return with control",
            "Alternate sides"
        ],
        "tips": ["Keep hips level", "Don't arch back"],
        "tags": ["rehab", "core", "stability", "lower back"],
        "pain_focus": "lower-back",
        "is_rehab": True
    },
    {
        "name": "McGill Curl-Up",
        "muscle": "abs",
        "secondary_muscles": ["core"],
        "equipment": "bodyweight",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Lie on back, one leg bent, one straight",
            "Place hands under lower back to maintain natural curve",
            "Lift head and shoulders slightly off ground",
            "Hold, then lower"
        ],
        "tips": ["Keep lower back neutral", "Small range of motion"],
        "tags": ["rehab", "core", "lower back safe"],
        "pain_focus": "lower-back",
        "is_rehab": True
    },
    {
        "name": "Wall Angel",
        "muscle": "shoulders",
        "secondary_muscles": ["upper-back"],
        "equipment": "bodyweight",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Stand with back flat against wall",
            "Arms in 'goal post' position against wall",
            "Slide arms up and down wall",
            "Keep back and arms in contact with wall"
        ],
        "tips": ["Keep core engaged", "Don't arch back"],
        "tags": ["rehab", "shoulder mobility", "posture"],
        "pain_focus": "shoulders",
        "is_rehab": True
    },
    {
        "name": "Knee-to-Chest Stretch",
        "muscle": "lower-back",
        "secondary_muscles": ["glutes"],
        "equipment": "bodyweight",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Lie on back with knees bent",
            "Pull one knee toward chest",
            "Hold stretch, keeping other foot on floor",
            "Switch sides"
        ],
        "tips": ["Keep lower back pressed to floor", "Breathe deeply"],
        "tags": ["rehab", "stretch", "lower back relief"],
        "pain_focus": "lower-back",
        "is_rehab": True
    },
    {
        "name": "Chin Tuck",
        "muscle": "neck",
        "secondary_muscles": [],
        "equipment": "bodyweight",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Sit or stand with good posture",
            "Pull chin straight back, creating double chin",
            "Hold for 5 seconds",
            "Release and repeat"
        ],
        "tips": ["Don't tilt head up or down", "Keep eyes forward"],
        "tags": ["rehab", "neck", "posture"],
        "pain_focus": "neck",
        "is_rehab": True
    },
    {
        "name": "Terminal Knee Extension",
        "muscle": "quads",
        "secondary_muscles": [],
        "equipment": "resistance-band",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Loop band behind knee, attach other end to anchor",
            "Stand facing anchor with slight knee bend",
            "Straighten knee against band resistance",
            "Control return"
        ],
        "tips": ["Focus on VMO activation", "Keep hips stable"],
        "tags": ["rehab", "knee", "VMO"],
        "pain_focus": "knees",
        "is_rehab": True
    },
    {
        "name": "Side-Lying Hip Abduction",
        "muscle": "abductors",
        "secondary_muscles": ["glutes"],
        "equipment": "bodyweight",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Lie on side with legs stacked",
            "Lift top leg toward ceiling",
            "Keep leg straight and hips stacked",
            "Lower with control"
        ],
        "tips": ["Don't rotate hips", "Keep toes pointing forward"],
        "tags": ["rehab", "hip", "glute med"],
        "pain_focus": "hips",
        "is_rehab": True,
        "gender": "female"
    },
    {
        "name": "Shoulder External Rotation",
        "muscle": "shoulders",
        "secondary_muscles": ["rotator cuff"],
        "equipment": "resistance-band",
        "category": "rehab",
        "difficulty": "beginner",
        "instructions": [
            "Hold band with elbow at side, bent 90 degrees",
            "Rotate forearm outward against band",
            "Keep elbow pinned to side",
            "Return with control"
        ],
        "tips": ["Don't shrug shoulder", "Keep movement slow"],
        "tags": ["rehab", "shoulder", "rotator cuff"],
        "pain_focus": "shoulders",
        "is_rehab": True
    },

    # ==================== CARDIO ====================
    {
        "name": "Jumping Jack",
        "muscle": "full-body",
        "secondary_muscles": ["shoulders", "calves"],
        "equipment": "bodyweight",
        "category": "cardio",
        "difficulty": "beginner",
        "instructions": [
            "Stand with feet together, arms at sides",
            "Jump feet out while raising arms overhead",
            "Jump back to starting position",
            "Repeat continuously"
        ],
        "tips": ["Land softly", "Keep core engaged"],
        "tags": ["cardio", "warmup", "full body"]
    },
    {
        "name": "Burpee",
        "muscle": "full-body",
        "secondary_muscles": ["chest", "quads", "core"],
        "equipment": "bodyweight",
        "category": "cardio",
        "difficulty": "intermediate",
        "instructions": [
            "Stand, then squat down and place hands on floor",
            "Jump feet back to plank position",
            "Perform push-up (optional)",
            "Jump feet back to hands, then jump up with arms overhead"
        ],
        "tips": ["Modify by stepping instead of jumping", "Keep core tight in plank"],
        "tags": ["cardio", "full body", "HIIT"],
        "is_popular": True
    },
    {
        "name": "Mountain Climber",
        "muscle": "core",
        "secondary_muscles": ["shoulders", "hip-flexors", "quads"],
        "equipment": "bodyweight",
        "category": "cardio",
        "difficulty": "beginner",
        "instructions": [
            "Start in plank position",
            "Drive one knee toward chest",
            "Quickly switch legs",
            "Continue alternating at pace"
        ],
        "tips": ["Keep hips level", "Maintain plank position"],
        "tags": ["cardio", "core", "HIIT"]
    },
    {
        "name": "Box Jump",
        "muscle": "quads",
        "secondary_muscles": ["glutes", "calves"],
        "equipment": "box",
        "category": "plyometric",
        "difficulty": "intermediate",
        "instructions": [
            "Stand in front of box, feet shoulder-width",
            "Swing arms back, then jump onto box",
            "Land softly with knees bent",
            "Step down and repeat"
        ],
        "tips": ["Start with lower box", "Land quietly"],
        "tags": ["plyometric", "power", "legs"]
    },

    # ==================== OLYMPIC LIFTS ====================
    {
        "name": "Power Clean",
        "muscle": "full-body",
        "secondary_muscles": ["traps", "quads", "glutes", "shoulders"],
        "equipment": "barbell",
        "category": "olympic",
        "difficulty": "advanced",
        "instructions": [
            "Start with bar on floor, similar to deadlift position",
            "Pull bar explosively as you extend hips",
            "Shrug and pull under bar as it rises",
            "Catch bar in front rack position",
            "Stand to complete lift"
        ],
        "tips": ["Start light to learn technique", "Keep bar close"],
        "tags": ["olympic", "power", "compound"],
        "is_featured": True
    },
    {
        "name": "Snatch",
        "muscle": "full-body",
        "secondary_muscles": ["shoulders", "back", "quads", "glutes"],
        "equipment": "barbell",
        "category": "olympic",
        "difficulty": "expert",
        "instructions": [
            "Wide grip on bar, start position like deadlift",
            "Explosively extend hips and pull bar high",
            "Drop under bar and catch overhead with locked arms",
            "Stand to complete lift"
        ],
        "tips": ["Master overhead squat first", "Start with PVC pipe or empty bar"],
        "tags": ["olympic", "power", "compound", "advanced"]
    },
]


def get_seed_exercises():
    """Return the seed exercise data."""
    return MUSCLEWIKI_EXERCISES
