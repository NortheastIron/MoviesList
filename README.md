# MoviesList

Test project on Angular 17

Запуск:

1. npm install
2. npm start
3. open browser on dev server page

Немного комментариев:

Input Search реализован весьма мудрёно :
1) обычный поиск, если от 3х символов
2) если нажать лупу, то можно произвести поиск и с меньшим значением символов
3) если нажал лупу (при 1-2 символах), а затем стёр хотя бы 1, то будет пустой поиск

DatePicker ...:
1) работает в 2-х режимах... год и дата/месяц/год

PopupComponent ...:
1) Отрисовка для различных варианов вертикального расположения

CustomInput\CustomRange\CustomTextArea ...:
1) Расширение базовых тегов для различных ситуаций




Задачи на будущее:

0. signals
1. изменение shared/components под Forms    
2. Хранение состояния
3. отдельная страница для movies-details
4. работа с изображением
5. Больше фильтров, например рейтинг
6. переделать масштабирование страницы
7. кастомный скролл чтобы убрать смещение ...или пагинация
8. доработка модального окна в более глобальный абстрактный компонент
9. Вариация с многими жанрами и multi-select
10. Сортировка фильмов
12. MainHeader ... управление страницей, навигация.

# посмотреть места с //exp