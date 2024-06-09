export default function About() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-2xl mx-auto p-3 text-center'>
        <div>
          <h1 className='text-3xl font font-semibold text-center my-7'>
            Мой блог
          </h1>
          <div className='text-md text-gray-500 flex flex-col gap-6'>
            <p>
              Добро пожаловать на мой проект по вебу! Он был создан с целью, но главное с любовью.
              Трижды переделывал его, хотел сделать лучше всех, но и так неплохо получилось.
              Было много боли, особенно по фронту, ух как я не люблю его. И зачем спрашивается только полез...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
