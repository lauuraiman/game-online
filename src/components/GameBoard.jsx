import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://game-server-1ybw.onrender.com';
const socket = io(SOCKET_URL);

const BOARD_CELLS = [
  { id: 0, name: 'СТАРТ' },
  { id: 1, name: 'Правила игры' },
  { id: 2, name: 'Захват денег' },
  { id: 3, name: 'Плата' },
  { id: 4, name: 'Иллюзия' },
  { id: 5, name: 'Дискомфорт' },
  { id: 6, name: 'НОВОЕ ДЕЙСТВИЕ (动)' },
  { id: 7, name: 'Истинная суть денег' },
  { id: 8, name: 'Помощь' },
  { id: 9, name: 'Проверка' },
  { id: 10, name: 'Освобождение' },
  { id: 11, name: 'Изобилие' }
];

const LEVEL_NAMES = [
  'Захват денег',
  'Плата',
  'Иллюзия',
  'Дискомфорт',
  'Истинная суть денег',
  'Помощь',
  'Проверка',
  'Освобождение'
];

const createHistory = () => ({
  'Захват денег': [],
  'Плата': [],
  'Иллюзия': [],
  'Дискомфорт': [],
  'Истинная суть денег': [],
  'Помощь': [],
  'Проверка': [],
  'Освобождение': []
});

const createPlayer = (name, id) => ({
  id,
  name,
  cellIndex: 0,
  subStep: 1,
  yearsLeft: 0,
  goal: '',
  rule: '',
  newActionCustomText: '',
  isFinished: false,
  levelCardsHistory: createHistory()
});

function GameBoard({ roomCode, playersList = [] }) {
  // =========================================================
  // СОСТОЯНИЕ
  // =========================================================

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth <= 768
      : false
  );

  const [players, setPlayers] = useState(() =>
    playersList.map((name, index) =>
      createPlayer(name, index)
    )
  );

  const getRoomIdFromUrl = () => {
    if (typeof window === 'undefined') {
      return roomCode
        ? roomCode.toUpperCase()
        : Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
    }

    const pathSegments =
      window.location.pathname.split('/');

    const lastSegment =
      pathSegments[pathSegments.length - 1];

    if (
      lastSegment &&
      lastSegment !== '' &&
      lastSegment !== 'room'
    ) {
      return lastSegment.toUpperCase();
    }

    return roomCode
      ? roomCode.toUpperCase()
      : Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
  };

  const [roomId] = useState(
    getRoomIdFromUrl
  );

  const [copied, setCopied] = useState(false);

  const [activePlayerIndex, setActivePlayerIndex] =
    useState(0);

  const [dice1, setDice1] = useState(null);
  const [dice2, setDice2] = useState(null);

  const [isRolling, setIsRolling] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(null);

  const [currentYearCard, setCurrentYearCard] =
    useState(null);

  const [diceResultModal, setDiceResultModal] =
    useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [hasRolled, setHasRolled] =
    useState(false);

  const [newActionText, setNewActionText] =
    useState('');

  const [pendingActionPlayer, setPendingActionPlayer] =
    useState(null);

  const [setupInputModal, setSetupInputModal] =
    useState(null);

  const [tempInputValue, setTempInputValue] =
    useState('');

  const [isPlayersListOpen, setIsPlayersListOpen] =
    useState(false);

  const [selectedPlayerModal, setSelectedPlayerModal] =
    useState(null);

  // =========================================================
  // 15 КАРТОЧЕК В КАЖДОЙ СЕКЦИИ
  // =========================================================

  const questionsDatabase = {
    'Захват денег': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ],

    'Плата': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ],

    'Иллюзия': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ],

    'Дискомфорт': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ],

    'Истинная суть денег': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ],

    'Помощь': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ],

    'Проверка': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ],

    'Освобождение': [
      'Вопрос 1 — добавь свой вопрос',
      'Вопрос 2 — добавь свой вопрос',
      'Вопрос 3 — добавь свой вопрос',
      'Вопрос 4 — добавь свой вопрос',
      'Вопрос 5 — добавь свой вопрос',
      'Вопрос 6 — добавь свой вопрос',
      'Вопрос 7 — добавь свой вопрос',
      'Вопрос 8 — добавь свой вопрос',
      'Вопрос 9 — добавь свой вопрос',
      'Вопрос 10 — добавь свой вопрос',
      'Вопрос 11 — добавь свой вопрос',
      'Вопрос 12 — добавь свой вопрос',
      'Вопрос 13 — добавь свой вопрос',
      'Вопрос 14 — добавь свой вопрос',
      'Вопрос 15 — добавь свой вопрос'
    ]
  };

  // =========================================================
  // SOCKET + RESIZE
  // =========================================================

  useEffect(() => {
    const handleJoinResponse = (response) => {
      if (response?.success) {
        console.log(
          `Подключились к комнате: ${roomId}`
        );
      } else {
        console.error(
          response?.message ||
            'Не удалось подключиться к комнате'
        );
      }
    };

    socket.emit(
      'join_room',
      { roomId },
      handleJoinResponse
    );

    const handlePlayerJoined = (data) => {
      if (data?.players) {
        console.log(
          'Игроки в комнате:',
          data.players
        );
      }
    };

    socket.on(
      'player_joined',
      handlePlayerJoined
    );

    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= 768
      );
    };

    handleResize();

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      socket.off(
        'player_joined',
        handlePlayerJoined
      );

      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, [roomId]);

  // =========================================================
  // КОПИРОВАНИЕ ССЫЛКИ
  // =========================================================

  const copyInviteLink = async () => {
    const inviteLink =
      `${window.location.origin}/room/${roomId}`;

    try {
      await navigator.clipboard.writeText(
        inviteLink
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error(
        'Ошибка копирования:',
        error
      );

      window.prompt(
        'Скопируйте ссылку:',
        inviteLink
      );
    }
  };

  // =========================================================
  // КУБИК
  // =========================================================

  const renderDiceFace = (num) => {
    const dots = {
      1: [[50, 50]],

      2: [
        [25, 25],
        [75, 75]
      ],

      3: [
        [25, 25],
        [50, 50],
        [75, 75]
      ],

      4: [
        [25, 25],
        [25, 75],
        [75, 25],
        [75, 75]
      ],

      5: [
        [25, 25],
        [25, 75],
        [50, 50],
        [75, 25],
        [75, 75]
      ],

      6: [
        [25, 20],
        [25, 50],
        [25, 80],
        [75, 20],
        [75, 50],
        [75, 80]
      ]
    };

    const currentDots =
      dots[num] || dots[1];

    return (
      <div
        style={{
          width: '50px',
          height: '50px',
          background: '#fff',
          borderRadius: '9px',
          position: 'relative',
          border: '2px solid #ffd700',
          boxShadow:
            '0 4px 10px rgba(0,0,0,.5)'
        }}
      >
        {currentDots.map(
          (position, index) => (
            <span
              key={index}
              style={{
                position: 'absolute',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#111',
                left: `${position[0]}%`,
                top: `${position[1]}%`,
                transform:
                  'translate(-50%, -50%)'
              }}
            />
          )
        )}
      </div>
    );
  };

  // =========================================================
  // БРОСОК
  // =========================================================

  const rollDice = () => {
    const currentPlayer =
      players[activePlayerIndex];

    if (!currentPlayer) return;

    if (
      currentPlayer.isFinished ||
      hasRolled ||
      isRolling
    ) {
      return;
    }

    if (!currentPlayer.goal) {
      setSetupInputModal('goal');
      setTempInputValue('');
      return;
    }

    if (!currentPlayer.rule) {
      setSetupInputModal('rule');
      setTempInputValue('');
      return;
    }

    setIsRolling(true);

    setTimeout(() => {
      const d1 =
        Math.floor(
          Math.random() * 6
        ) + 1;

      const d2 =
        Math.floor(
          Math.random() * 6
        ) + 1;

      const total = d1 + d2;

      setDice1(d1);
      setDice2(d2);
      setIsRolling(false);
      setHasRolled(true);

      /*
       * У каждой клетки 6 подшагов.
       * Движение:
       * 1 -> следующий подшаг
       * 6 -> переход на следующую клетку.
       */

      const currentGlobalStep =
        currentPlayer.cellIndex * 6 +
        (currentPlayer.subStep - 1);

      const targetGlobalStep =
        currentGlobalStep + total;

      const actionGlobalStep =
        6 * 6;

      const finishGlobalStep =
        11 * 6;

      let finalCellIndex;
      let finalSubStep;
      let hitActionNode = false;

      if (
        currentGlobalStep <
          actionGlobalStep &&
        targetGlobalStep >=
          actionGlobalStep
      ) {
        hitActionNode = true;
      }

      if (hitActionNode) {
        finalCellIndex = 6;
        finalSubStep = 1;
      } else if (
        targetGlobalStep >=
        finishGlobalStep
      ) {
        finalCellIndex = 11;
        finalSubStep = 1;
      } else {
        finalCellIndex =
          Math.floor(
            targetGlobalStep / 6
          );

        finalSubStep =
          (targetGlobalStep % 6) + 1;
      }

      const updatedPlayers =
        players.map((player) => ({
          ...player,
          levelCardsHistory: {
            ...player.levelCardsHistory
          }
        }));

      const updatedPlayer = {
        ...updatedPlayers[
          activePlayerIndex
        ]
      };

      updatedPlayer.cellIndex =
        finalCellIndex;

      updatedPlayer.subStep =
        finalSubStep;

      if (finalCellIndex === 11) {
        updatedPlayer.isFinished =
          true;
      }

      let yearsSpent = 0;

      if (
        finalCellIndex >= 2 &&
        finalCellIndex !== 11
      ) {
        const allowedYears = [
          0,
          1,
          3,
          5,
          7,
          12,
          25,
          37
        ];

        yearsSpent =
          allowedYears[
            Math.floor(
              Math.random() *
                allowedYears.length
            )
          ];

        updatedPlayer.yearsLeft =
          (updatedPlayer.yearsLeft || 0) +
          yearsSpent;

        setCurrentYearCard(
          yearsSpent
        );
      } else {
        setCurrentYearCard(null);
      }

      updatedPlayers[
        activePlayerIndex
      ] = updatedPlayer;

      setPlayers(updatedPlayers);

      setDiceResultModal({
        d1,
        d2,
        total,
        finalCellIndex,
        isAction:
          finalCellIndex === 6,
        currentPlayerId:
          currentPlayer.id
      });
    }, 1500);
  };

  // =========================================================
  // ПОСЛЕ БРОСКА
  // =========================================================

  const handleDiceResultOk = () => {
    if (!diceResultModal) return;

    const data = diceResultModal;

    setDiceResultModal(null);

    if (data.isAction) {
      setPendingActionPlayer(
        data.currentPlayerId
      );

      setIsModalOpen(true);

      setCurrentQuestion(null);
      setCurrentYearCard(null);

      return;
    }

    const cell =
      BOARD_CELLS[data.finalCellIndex];

    if (
      !cell ||
      data.finalCellIndex <= 1 ||
      data.finalCellIndex === 11
    ) {
      return;
    }

    const questions =
      questionsDatabase[cell.name];

    if (
      !questions ||
      questions.length === 0
    ) {
      return;
    }

    const updatedPlayers =
      players.map((player) => ({
        ...player,
        levelCardsHistory: {
          ...player.levelCardsHistory
        }
      }));

    const player =
      updatedPlayers[
        activePlayerIndex
      ];

    if (!player) return;

    if (
      data.finalCellIndex === 2
    ) {
      const shuffled =
        [...questions].sort(
          () => Math.random() - 0.5
        );

      const selectedCards = [
        shuffled[0],
        shuffled[1] || shuffled[0]
      ];

      const history = {
        ...player.levelCardsHistory,
        [cell.name]: [
          ...(player.levelCardsHistory[
            cell.name
          ] || []),
          ...selectedCards
        ]
      };

      player.levelCardsHistory =
        history;

      updatedPlayers[
        activePlayerIndex
      ] = player;

      setPlayers(updatedPlayers);

      setCurrentQuestion({
        cell: cell.name,
        text: selectedCards,
        isMultiple: true
      });

      return;
    }

    const randomQuestion =
      questions[
        Math.floor(
          Math.random() *
            questions.length
        )
      ];

    player.levelCardsHistory = {
      ...player.levelCardsHistory,
      [cell.name]: [
        ...(player.levelCardsHistory[
          cell.name
        ] || []),
        randomQuestion
      ]
    };

    updatedPlayers[
      activePlayerIndex
    ] = player;

    setPlayers(updatedPlayers);

    setCurrentQuestion({
      cell: cell.name,
      text: randomQuestion,
      isMultiple: false
    });
  };

  // =========================================================
  // ЦЕЛЬ / ПРАВИЛО
  // =========================================================

  const handleSaveSetupInput = () => {
    const value =
      tempInputValue.trim();

    if (!value) return;

    const updatedPlayers =
      [...players];

    const player =
      updatedPlayers[
        activePlayerIndex
      ];

    if (!player) return;

    if (
      setupInputModal === 'goal'
    ) {
      updatedPlayers[
        activePlayerIndex
      ] = {
        ...player,
        goal: value
      };

      setPlayers(updatedPlayers);

      setSetupInputModal(null);
      setTempInputValue('');

      return;
    }

    if (
      setupInputModal === 'rule'
    ) {
      updatedPlayers[
        activePlayerIndex
      ] = {
        ...player,
        rule: value,
        cellIndex: 2,
        subStep: 1
      };

      setPlayers(updatedPlayers);

      setSetupInputModal(null);
      setTempInputValue('');

      const nextPlayer =
        updatedPlayers.findIndex(
          (item) =>
            !item.goal ||
            !item.rule
        );

      if (nextPlayer !== -1) {
        setActivePlayerIndex(
          nextPlayer
        );
      }
    }
  };

  // =========================================================
  // НОВОЕ ДЕЙСТВИЕ
  // =========================================================

  const handleApproveNewAction = () => {
    const text =
      newActionText.trim();

    if (!text) return;

    const targetIndex =
      players.findIndex(
        (player) =>
          player.id ===
          pendingActionPlayer
      );

    if (targetIndex === -1) {
      setIsModalOpen(false);
      return;
    }

    const updatedPlayers =
      [...players];

    const player =
      updatedPlayers[targetIndex];

    updatedPlayers[targetIndex] = {
      ...player,
      newActionCustomText: text,
      cellIndex: 7,
      subStep: 1,
      levelCardsHistory: {
        ...player.levelCardsHistory
      }
    };

    const questions =
      questionsDatabase[
        'Истинная суть денег'
      ];

    const randomQuestion =
      questions[
        Math.floor(
          Math.random() *
            questions.length
        )
      ];

    updatedPlayers[targetIndex] = {
      ...updatedPlayers[targetIndex],
      levelCardsHistory: {
        ...updatedPlayers[
          targetIndex
        ].levelCardsHistory,
        'Истинная суть денег': [
          ...(updatedPlayers[
            targetIndex
          ].levelCardsHistory[
            'Истинная суть денег'
          ] || []),
          randomQuestion
        ]
      }
    };

    setPlayers(updatedPlayers);

    setCurrentQuestion({
      cell: 'Истинная суть денег',
      text: randomQuestion,
      isMultiple: false
    });

    setIsModalOpen(false);
    setNewActionText('');
    setPendingActionPlayer(null);
    setHasRolled(false);
  };

  // =========================================================
  // ОТКАЗ ОТ НОВОГО ДЕЙСТВИЯ
  // =========================================================

  const handleRejectNewAction = () => {
    const targetIndex =
      players.findIndex(
        (player) =>
          player.id ===
          pendingActionPlayer
      );

    if (targetIndex === -1) {
      setIsModalOpen(false);
      return;
    }

    const updatedPlayers =
      [...players];

    updatedPlayers[targetIndex] = {
      ...updatedPlayers[
        targetIndex
      ],
      cellIndex: 0,
      subStep: 1,
      goal: '',
      rule: '',
      newActionCustomText: ''
    };

    setPlayers(updatedPlayers);

    setIsModalOpen(false);
    setNewActionText('');

    setDice1(null);
    setDice2(null);
    setCurrentYearCard(null);
    setHasRolled(false);

    setPendingActionPlayer(null);

    setActivePlayerIndex(
      targetIndex
    );

    setSetupInputModal('goal');
    setTempInputValue('');
  };

  // =========================================================
  // СЛЕДУЮЩИЙ ХОД
  // =========================================================

  const nextTurn = () => {
    if (!players.length) return;

    if (
      players.every(
        (player) =>
          player.isFinished
      )
    ) {
      alert(
        '🎉 Все игроки достигли Изобилия! Игра завершена.'
      );

      return;
    }

    let nextIndex =
      (activePlayerIndex + 1) %
      players.length;

    let counter = 0;

    while (
      players[nextIndex]?.isFinished &&
      counter < players.length
    ) {
      nextIndex =
        (nextIndex + 1) %
        players.length;

      counter++;
    }

    setActivePlayerIndex(
      nextIndex
    );

    setDice1(null);
    setDice2(null);
    setCurrentYearCard(null);
    setCurrentQuestion(null);
    setHasRolled(false);
  };

  // =========================================================
  // КНОПКА
  // =========================================================

  const getButtonText = () => {
    const player =
      players[activePlayerIndex];

    if (!player) {
      return 'Ожидание игроков';
    }

    if (player.isFinished) {
      return '✨ Достиг Изобилия';
    }

    if (!player.goal) {
      return `🎯 Ввести цель (${player.name})`;
    }

    if (!player.rule) {
      return `📜 Написать правило (${player.name})`;
    }

    if (hasRolled) {
      return 'Ход сделан';
    }

    return '🎲 Бросить кубики';
  };

  // =========================================================
  // ПРОИЗВОДНЫЕ ДАННЫЕ
  // =========================================================

  const activePlayer =
    players[activePlayerIndex];

  const phase1Cells =
    BOARD_CELLS.slice(2, 6);

  const centerCell =
    BOARD_CELLS[6];

  const phase2Cells =
    BOARD_CELLS.slice(7, 11);

  const allGoalsEntered =
    players.length > 0 &&
    players.every(
      (player) =>
        Boolean(player.goal)
    );

  const allRulesEntered =
    players.length > 0 &&
    players.every(
      (player) =>
        Boolean(player.rule)
    );

  // =========================================================
  // ЕСЛИ НЕТ ИГРОКОВ
  // =========================================================

  if (!activePlayer) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#111',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            textAlign: 'center'
          }}
        >
          <h2
            style={{
              color: '#ffd700'
            }}
          >
            Ожидание игроков
          </h2>

          <p>
            В комнате пока нет
            игроков.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ОСНОВНОЙ ЭКРАН
  // =========================================================

  return (
    <div
      className="game-board-container"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: isMobile
          ? '10px'
          : '20px',
        background: '#111',
        color: '#fff'
      }}
    >
      {/* =====================================================
          ШАПКА
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '15px'
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#ffd700'
          }}
        >
          Комната: {roomId}
        </h2>

        <button
          onClick={copyInviteLink}
          style={{
            padding: '9px 14px',
            border: 'none',
            borderRadius: '6px',
            background: '#ffd700',
            color: '#111',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {copied
            ? '✓ Скопировано'
            : 'Скопировать ссылку'}
        </button>
      </div>

      {/* =====================================================
          МОБИЛЬНАЯ КНОПКА ИГРОКОВ
      ====================================================== */}

      {isMobile && (
        <button
          onClick={() =>
            setIsPlayersListOpen(true)
          }
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            background:
              'linear-gradient(135deg,#b8860b,#ffd700)',
            color: '#111',
            border: 'none',
            borderRadius: '7px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          👥 Игроки
        </button>
      )}

      {/* =====================================================
          КАРТОЧКИ ИГРОКОВ
      ====================================================== */}

      {!isMobile && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '15px'
          }}
        >
          {players.map(
            (player, index) => (
              <div
                key={player.id}
                onClick={() =>
                  setSelectedPlayerModal(
                    player
                  )
                }
                style={{
                  minWidth: '220px',
                  maxWidth: '250px',
                  flexShrink: 0,
                  background:
                    '#1a0505',
                  border:
                    index ===
                    activePlayerIndex
                      ? '2px solid #ffd700'
                      : '1px solid rgba(255,215,0,.4)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    color: '#ffd700',
                    fontWeight: 'bold',
                    marginBottom: '7px'
                  }}
                >
                  <span>
                    {player.name}
                  </span>

                  {index ===
                    activePlayerIndex && (
                    <span>⭐</span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#ddd',
                    lineHeight: 1.5
                  }}
                >
                  <div>
                    Поле:{' '}
                    <b>
                      {
                        BOARD_CELLS[
                          player
                            .cellIndex
                        ]?.name
                      }
                    </b>
                  </div>

                  <div>
                    Шаг:{' '}
                    <b>
                      {
                        player.subStep
                      }
                      /6
                    </b>
                  </div>

                  <div>
                    Годы:{' '}
                    <b>
                      {
                        player.yearsLeft
                      }
                    </b>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '7px',
                    paddingTop: '7px',
                    borderTop:
                      '1px solid rgba(255,215,0,.2)',
                    fontSize: '11px',
                    color: '#aaa'
                  }}
                >
                  🎯{' '}
                  {player.goal ||
                    'Цель не задана'}
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: '#aaa',
                    marginTop: '3px'
                  }}
                >
                  📜{' '}
                  {player.rule ||
                    'Правило не задано'}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* =====================================================
          ИГРОВОЕ ПОЛЕ
      ====================================================== */}

      <div
        className="infinity-board"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        {/* СТАРТ / ПРАВИЛА */}

        <div
          className="setup-cells-row"
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2,minmax(0,1fr))',
            gap: '10px'
          }}
        >
          {BOARD_CELLS.slice(
            0,
            2
          ).map((cell) => (
            <BoardCell
              key={cell.id}
              cell={cell}
              players={players}
            />
          ))}
        </div>

        {/* ФАЗА 1 */}

        <div className="phase-section">
          <div
            className="phase-title"
            style={{
              color: '#ffd700',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
            ФАЗА 1:
            Бессознательное
            повторение
          </div>

          <div
            className="cells-row"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4,minmax(0,1fr))',
              gap: '8px'
            }}
          >
            {phase1Cells.map(
              (cell) => (
                <BoardCell
                  key={cell.id}
                  cell={cell}
                  players={players}
                />
              )
            )}
          </div>
        </div>

        {/* НОВОЕ ДЕЙСТВИЕ */}

        <div
          className="center-action-node"
          style={{
            display: 'flex',
            justifyContent:
              'center'
          }}
        >
          <BoardCell
            cell={centerCell}
            players={players}
            center
          />
        </div>

        {/* ФАЗА 2 */}

        <div className="phase-section">
          <div
            className="phase-title"
            style={{
              color: '#ffd700',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
            ФАЗА 2:
            Осознанная жизнь
          </div>

          <div
            className="cells-row"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4,minmax(0,1fr))',
              gap: '8px'
            }}
          >
            {phase2Cells.map(
              (cell) => (
                <BoardCell
                  key={cell.id}
                  cell={cell}
                  players={players}
                />
              )
            )}
          </div>
        </div>

        {/* ИЗОБИЛИЕ */}

        <BoardCell
          cell={BOARD_CELLS[11]}
          players={players}
          finish
        />
      </div>

      {/* =====================================================
          ПАНЕЛЬ УПРАВЛЕНИЯ
      ====================================================== */}

      <div
        className="control-panel"
        style={{
          marginTop: '18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          className="active-player-info"
          style={{
            fontSize: '18px',
            color: '#ffd700'
          }}
        >
          Ходит:{' '}
          <b>
            {activePlayer.name}
          </b>
        </div>

        <button
          className="dice-btn"
          onClick={rollDice}
          disabled={
            activePlayer.isFinished ||
            hasRolled ||
            isRolling
          }
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '14px',
            border: 'none',
            borderRadius: '8px',
            background:
              'linear-gradient(135deg,#b8860b,#ffd700)',
            color: '#111',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor:
              activePlayer.isFinished ||
              hasRolled ||
              isRolling
                ? 'not-allowed'
                : 'pointer',
            opacity:
              activePlayer.isFinished ||
              hasRolled ||
              isRolling
                ? 0.55
                : 1
          }}
        >
          {isRolling
            ? '🎲 Бросаем...'
            : getButtonText()}
        </button>

        {dice1 !== null &&
          dice2 !== null &&
          !isRolling && (
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                gap: '10px'
              }}
            >
              {renderDiceFace(
                dice1
              )}

              {renderDiceFace(
                dice2
              )}

              <b
                style={{
                  color: '#ffd700'
                }}
              >
                = {dice1 + dice2}
              </b>
            </div>
          )}

        {currentYearCard !==
          null && (
          <div
            style={{
              color: '#ffd700',
              fontWeight: 'bold'
            }}
          >
            ⏳ Потрачено лет:{' '}
            +{currentYearCard}
          </div>
        )}

        <button
          className="next-turn-btn"
          onClick={nextTurn}
          disabled={
            !hasRolled
          }
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px',
            border:
              '1px solid #ffd700',
            borderRadius: '7px',
            background:
              'transparent',
            color: '#ffd700',
            fontWeight: 'bold',
            cursor:
              !hasRolled
                ? 'not-allowed'
                : 'pointer',
            opacity:
              !hasRolled ? 0.5 : 1
          }}
        >
          Завершить ход ➜
        </button>
      </div>

      {/* =====================================================
          МОБИЛЬНЫЙ СПИСОК ИГРОКОВ
      ====================================================== */}

      {isMobile &&
        isPlayersListOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center'
                }}
              >
                <h2
                  style={{
                    color:
                      '#ffd700',
                    margin: 0
                  }}
                >
                  👥 Игроки
                </h2>

                <button
                  onClick={() =>
                    setIsPlayersListOpen(
                      false
                    )
                  }
                  style={{
                    background:
                      'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize:
                      '24px',
                    cursor:
                      'pointer'
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: '8px',
                  marginTop:
                    '15px'
                }}
              >
                {players.map(
                  (
                    player,
                    index
                  ) => (
                    <div
                      key={
                        player.id
                      }
                      onClick={() => {
                        setSelectedPlayerModal(
                          player
                        );

                        setIsPlayersListOpen(
                          false
                        );
                      }}
                      style={{
                        padding:
                          '12px',
                        borderRadius:
                          '7px',
                        border:
                          index ===
                          activePlayerIndex
                            ? '2px solid #ffd700'
                            : '1px solid rgba(255,215,0,.3)',
                        background:
                          '#1a0505',
                        cursor:
                          'pointer'
                      }}
                    >
                      <b
                        style={{
                          color:
                            '#ffd700'
                        }}
                      >
                        {player.name}{' '}
                        {index ===
                          activePlayerIndex &&
                          '⭐'}
                      </b>

                      <div
                        style={{
                          fontSize:
                            '12px',
                          color:
                            '#ccc',
                          marginTop:
                            '4px'
                        }}
                      >
                        {
                          BOARD_CELLS[
                            player
                              .cellIndex
                          ]?.name
                        }{' '}
                        ·{' '}
                        {
                          player.yearsLeft
                        }{' '}
                        лет
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          КАРТОЧКА ИГРОКА
      ====================================================== */}

      {selectedPlayerModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              maxHeight: '90vh',
              overflowY:
                'auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center'
              }}
            >
              <h2
                style={{
                  color:
                    '#ffd700',
                  margin: 0
                }}
              >
                👤{' '}
                {
                  selectedPlayerModal.name
                }
              </h2>

              <button
                onClick={() =>
                  setSelectedPlayerModal(
                    null
                  )
                }
                style={{
                  background:
                    'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize:
                    '24px',
                  cursor:
                    'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <hr />

            <p>
              📍{' '}
              <b>
                Текущее поле:
              </b>{' '}
              {
                BOARD_CELLS[
                  selectedPlayerModal
                    .cellIndex
                ]?.name
              }
            </p>

            <p>
              👣{' '}
              <b>
                Подшаг:
              </b>{' '}
              {
                selectedPlayerModal.subStep
              }
              /6
            </p>

            <p>
              ⏳{' '}
              <b>
                Потрачено
                лет:
              </b>{' '}
              {
                selectedPlayerModal.yearsLeft
              }
            </p>

            {selectedPlayerModal.isFinished && (
              <p
                style={{
                  color:
                    '#ffd700'
                }}
              >
                ✨ Игрок достиг
                Изобилия!
              </p>
            )}

            <div>
              <h4
                style={{
                  color:
                    '#ffd700'
                }}
              >
                🎯 Цель
              </h4>

              <div
                style={{
                  background:
                    '#111',
                  padding:
                    '10px',
                  borderRadius:
                    '6px',
                  whiteSpace:
                    'pre-line'
                }}
              >
                {
                  selectedPlayerModal.goal ||
                  'Не заполнена'
                }
              </div>
            </div>

            <div>
              <h4
                style={{
                  color:
                    '#ffd700'
                }}
              >
                📜 Правило
              </h4>

              <div
                style={{
                  background:
                    '#111',
                  padding:
                    '10px',
                  borderRadius:
                    '6px',
                  whiteSpace:
                    'pre-line'
                }}
              >
                {
                  selectedPlayerModal.rule ||
                  'Не заполнено'
                }
              </div>
            </div>

            {selectedPlayerModal.newActionCustomText && (
              <div>
                <h4
                  style={{
                    color:
                      '#ffd700'
                  }}
                >
                  ⚡ Новое
                  действие
                </h4>

                <div
                  style={{
                    background:
                      '#111',
                    padding:
                      '10px',
                    borderRadius:
                      '6px'
                  }}
                >
                  {
                    selectedPlayerModal.newActionCustomText
                  }
                </div>
              </div>
            )}

            <h4
              style={{
                color:
                  '#ffd700'
              }}
            >
              🎴 История
              карточек
            </h4>

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: '8px'
              }}
            >
              {LEVEL_NAMES.map(
                (level) => {
                  const cards =
                    selectedPlayerModal
                      .levelCardsHistory?.[
                        level
                      ] || [];

                  return (
                    <div
                      key={level}
                      style={{
                        background:
                          '#1a0505',
                        border:
                          '1px solid rgba(255,215,0,.2)',
                        borderRadius:
                          '6px',
                        padding:
                          '8px'
                      }}
                    >
                      <b
                        style={{
                          color:
                            '#ffd700'
                        }}
                      >
                        {level}{' '}
                        (
                        {
                          cards.length
                        }
                        )
                      </b>

                      {cards.length ===
                      0 ? (
                        <div
                          style={{
                            color:
                              '#777',
                            marginTop:
                              '4px'
                          }}
                        >
                          Пока
                          нет
                          карточек
                        </div>
                      ) : (
                        cards.map(
                          (
                            card,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              style={{
                                marginTop:
                                  '5px',
                                padding:
                                  '7px',
                                background:
                                  'rgba(255,215,0,.06)',
                                borderRadius:
                                  '5px',
                                whiteSpace:
                                  'pre-line',
                                fontSize:
                                  '13px'
                              }}
                            >
                              {
                                card
                              }
                            </div>
                          )
                        )
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <button
              onClick={() =>
                setSelectedPlayerModal(
                  null
                )
              }
              style={{
                width: '100%',
                marginTop:
                  '15px',
                padding:
                  '12px',
                border: 'none',
                borderRadius:
                  '7px',
                background:
                  '#ffd700',
                color: '#111',
                fontWeight:
                  'bold',
                cursor:
                  'pointer'
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          РЕЗУЛЬТАТ КУБИКОВ
      ====================================================== */}

      {diceResultModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              textAlign:
                'center'
            }}
          >
            <h2
              style={{
                color:
                  '#ffd700'
              }}
            >
              🎲 Результат
            </h2>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'center',
                alignItems:
                  'center',
                gap: '15px',
                margin:
                  '20px 0'
              }}
            >
              {renderDiceFace(
                diceResultModal.d1
              )}

              {renderDiceFace(
                diceResultModal.d2
              )}
            </div>

            <div
              style={{
                fontSize:
                  '22px',
                fontWeight:
                  'bold',
                color:
                  '#ffd700',
                marginBottom:
                  '20px'
              }}
            >
              Сумма:{' '}
              {
                diceResultModal.total
              }
            </div>

            {diceResultModal.isAction && (
              <p>
                ⚡ Ты попал
                на «Новое
                действие»!
              </p>
            )}

            <button
              onClick={
                handleDiceResultOk
              }
              style={{
                width: '100%',
                padding:
                  '12px',
                border: 'none',
                borderRadius:
                  '7px',
                background:
                  '#ffd700',
                color: '#111',
                fontWeight:
                  'bold',
                cursor:
                  'pointer'
              }}
            >
              Продолжить
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          ЦЕЛЬ / ПРАВИЛО
      ====================================================== */}

      {setupInputModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2
              style={{
                color:
                  '#ffd700'
              }}
            >
              {setupInputModal ===
              'goal'
                ? `🎯 Цель: ${activePlayer.name}`
                : `📜 Правило: ${activePlayer.name}`}
            </h2>

            <p>
              {setupInputModal ===
              'goal'
                ? 'С каким запросом ты заходишь в игру?'
                : 'Какое правило ты выбираешь для себя на игру?'}
            </p>

            <textarea
              autoFocus
              value={
                tempInputValue
              }
              onChange={(event) =>
                setTempInputValue(
                  event.target
                    .value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  'Enter' &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  handleSaveSetupInput();
                }
              }}
              placeholder={
                setupInputModal ===
                'goal'
                  ? 'Моя цель...'
                  : 'Моё правило...'
              }
              style={{
                width: '100%',
                minHeight:
                  '100px',
                boxSizing:
                  'border-box',
                resize:
                  'vertical',
                background:
                  '#111',
                color:
                  '#fff',
                border:
                  '1px solid #777',
                borderRadius:
                  '6px',
                padding:
                  '10px',
                fontSize:
                  '15px'
              }}
            />

            <button
              onClick={
                handleSaveSetupInput
              }
              disabled={
                !tempInputValue.trim()
              }
              style={{
                width: '100%',
                marginTop:
                  '12px',
                padding:
                  '12px',
                border: 'none',
                borderRadius:
                  '7px',
                background:
                  '#ffd700',
                color: '#111',
                fontWeight:
                  'bold',
                cursor:
                  'pointer',
                opacity:
                  !tempInputValue.trim()
                    ? 0.5
                    : 1
              }}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          КАРТОЧКА ВОПРОСА
      ====================================================== */}

      {currentQuestion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2
              style={{
                color:
                  '#ffd700'
              }}
            >
              🎴{' '}
              {
                currentQuestion.cell
              }
            </h2>

            {currentQuestion.isMultiple ? (
              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: '10px'
                }}
              >
                {currentQuestion.text.map(
                  (
                    text,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      style={{
                        background:
                          '#111',
                        border:
                          '1px solid rgba(255,215,0,.3)',
                        borderRadius:
                          '7px',
                        padding:
                          '12px',
                        whiteSpace:
                          'pre-line'
                      }}
                    >
                      {text}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div
                style={{
                  background:
                    '#111',
                  border:
                    '1px solid rgba(255,215,0,.3)',
                  borderRadius:
                    '7px',
                  padding:
                    '15px',
                  whiteSpace:
                    'pre-line',
                  lineHeight:
                    '1.5'
                }}
              >
                {
                  currentQuestion.text
                }
              </div>
            )}

            <button
              onClick={() =>
                setCurrentQuestion(
                  null
                )
              }
              style={{
                width: '100%',
                marginTop:
                  '15px',
                padding:
                  '12px',
                border: 'none',
                borderRadius:
                  '7px',
                background:
                  '#ffd700',
                color: '#111',
                fontWeight:
                  'bold',
                cursor:
                  'pointer'
              }}
            >
              Продолжить
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          НОВОЕ ДЕЙСТВИЕ
      ====================================================== */}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2
              style={{
                color:
                  '#ffd700'
              }}
            >
              ⚡ НОВОЕ
              ДЕЙСТВИЕ
            </h2>

            <p
              style={{
                color:
                  '#ffd700',
                fontWeight:
                  'bold'
              }}
            >
              Игрок:{' '}
              {
                players.find(
                  (player) =>
                    player.id ===
                    pendingActionPlayer
                )?.name
              }
            </p>

            <p>
              Напиши новое
              осознанное
              действие.
            </p>

            <textarea
              autoFocus
              value={
                newActionText
              }
              onChange={(event) =>
                setNewActionText(
                  event.target
                    .value
                )
              }
              placeholder="Я выбираю..."
              style={{
                width: '100%',
                minHeight:
                  '100px',
                boxSizing:
                  'border-box',
                resize:
                  'vertical',
                background:
                  '#111',
                color:
                  '#fff',
                border:
                  '1px solid #777',
                borderRadius:
                  '6px',
                padding:
                  '10px',
                fontSize:
                  '15px'
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '10px',
                marginTop:
                  '12px'
              }}
            >
              <button
                onClick={
                  handleApproveNewAction
                }
                disabled={
                  !newActionText.trim()
                }
                style={{
                  padding:
                    '12px',
                  border: 'none',
                  borderRadius:
                    '7px',
                  background:
                    '#ffd700',
                  color:
                    '#111',
                  fontWeight:
                    'bold',
                  cursor:
                    'pointer',
                  opacity:
                    !newActionText.trim()
                      ? 0.5
                      : 1
                }}
              >
                ✓ Принять
              </button>

              <button
                onClick={
                  handleRejectNewAction
                }
                style={{
                  padding:
                    '12px',
                  border:
                    '1px solid #b33',
                  borderRadius:
                    '7px',
                  background:
                    '#300',
                  color:
                    '#fff',
                  fontWeight:
                    'bold',
                  cursor:
                    'pointer'
                }}
              >
                ↩ В Старт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// КОМПОНЕНТ КЛЕТКИ
// =========================================================

function BoardCell({
  cell,
  players,
  center = false,
  finish = false
}) {
  const playersOnCell =
    players.filter(
      (player) =>
        player.cellIndex ===
        cell.id
    );

  return (
    <div
      className={`board-cell ${
        center
          ? 'cell-center'
          : ''
      } ${
        finish
          ? 'finish-cell'
          : ''
      } ${
        playersOnCell.length
          ? 'active-cell-glow'
          : ''
      }`}
      style={{
        minHeight: '90px',
        background:
          finish
            ? 'linear-gradient(135deg,#3a2600,#1a0505)'
            : center
            ? 'linear-gradient(135deg,#3a2600,#1a0505)'
            : '#1a0505',
        border:
          playersOnCell.length
            ? '2px solid #ffd700'
            : '1px solid rgba(255,215,0,.35)',
        borderRadius:
          '8px',
        padding: '10px',
        boxSizing:
          'border-box',
        display: 'flex',
        flexDirection:
          'column',
        alignItems:
          'center',
        justifyContent:
          'center',
        textAlign: 'center',
        boxShadow:
          playersOnCell.length
            ? '0 0 18px rgba(255,215,0,.35)'
            : 'none'
      }}
    >
      <span
        style={{
          color: '#ffd700',
          fontWeight: 'bold',
          fontSize: '13px'
        }}
      >
        {cell.name}
      </span>

      {playersOnCell.length >
        0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent:
              'center',
            gap: '4px',
            marginTop:
              '8px'
          }}
        >
          {playersOnCell.map(
            (player) => (
              <span
                key={
                  player.id
                }
                title={
                  player.name
                }
                style={{
                  display:
                    'inline-flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  minWidth:
                    '28px',
                  height:
                    '28px',
                  padding:
                    '0 4px',
                  borderRadius:
                    '50%',
                  background:
                    '#ffd700',
                  color:
                    '#111',
                  fontSize:
                    '10px',
                  fontWeight:
                    'bold'
                }}
              >
                {player.name?.[0] ||
                  '?'}
                {player.subStep}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default GameBoard;